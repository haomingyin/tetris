const BOARD_ID = '#tetris-board';
const ROW = 17;
const COL = 9;

const CELL_STATUS_EMPTY = 'tetris-empty';
const CELL_STATUS_MOVING = 'tetris-moving';
const CELL_STATUS_FIXED = 'tetris-fixed';
const CELL_STATUS_CANCEL = 'tetris-cancel';
const CELL_STATUS_NEXT_FIXED = 'tetris-next-fixed';

let GAME_STEP_TIMER;
let GAME_POINTS;
let GAME_LEVEL;
let GAME_INTERVAL;

let BITS_FIXED;
let BLOCK;
let NEXT_BLOCK;
let TOP_PADDING;
let RIGHT_PADDING;

let MUTEX = false;
let GAME_PAUSED = false;

function testAndSetMutex() {
    let temp = MUTEX;
    MUTEX = true;
    return temp;
}

function lockMutex(cb) {
    if (!testAndSetMutex()) {
        cb();
        unlockMutex();
    }
}

function waitAndLockMutex(cb) {
    if (!testAndSetMutex()) {
        cb();
    } else {
        setTimeout(waitAndLockMutex, 0);
    }
}

function unlockMutex() {
    MUTEX = false;
}


/*************************************
 * MODEL
 *************************************/

function initBlock() {
    if (!NEXT_BLOCK) {
        initNextBlock();
    }
    BLOCK = NEXT_BLOCK;
    initNextBlock();

    TOP_PADDING = -2;
    RIGHT_PADDING = 4;
    printLog(`Initialized block ${BLOCK.name} with TOP_PADDING=${TOP_PADDING}, RIGHT_PADDING=${RIGHT_PADDING}.`);
}

function initNextBlock() {
    NEXT_BLOCK = blocks[Math.floor(Math.random() * 7)][0];
    printLog(`Next block will be ${NEXT_BLOCK.name}.`);
}

function initGamePoints() {
    GAME_POINTS = 0;
    displayGamePoints();
}

function initGameLevel() {
    GAME_LEVEL = 0;
    displayGameLevel();
}

function fixBlock(topPadding, rightPadding, block) {
    for (let i = 0; i < block.row; i++) {
        BITS_FIXED[i + topPadding] |= (block.bits[i] << rightPadding);
    }
}

function isMovable(topPadding, rightPadding, block) {
    if (topPadding + block.row > ROW
        || rightPadding + block.col > COL
        || rightPadding < 0) {
        return false;
    }

    for (let i = 0; i < block.row; i++) {
        if (i + topPadding < 0) {
            continue;
        }
        if ((block.bits[i] << rightPadding) & BITS_FIXED[i + topPadding]) {
            return false;
        }
    }
    return true;
}

function printLog(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function printMovementLog(direction, isSuccessful = 1) {
    if (isSuccessful) {
        printLog(`Moved ${BLOCK.name} ${direction}.`);
    } else {
        printLog(`Failed to move ${BLOCK.name} ${direction}.`)
    }
}

/**
 * Test if the given row bit map is fully filled.
 * @param bits
 * @returns {boolean}
 */
function isFullRow(bits) {
    return bits === (Math.pow(2, COL) - 1);
}

function getFullRows() {
    let fullRows = [];
    BITS_FIXED.forEach((bits, index) => {
        if (isFullRow(bits)) {
            fullRows.push(index);
        }
    });
    return fullRows;
}

/**************************************
 * VIEW
 **************************************/

/**
 * Top left is row-0 col-0.
 * @param row the number of rows
 * @param col the number of columns
 */
function initBoard(row, col) {
    BITS_FIXED = [];
    let board = $(BOARD_ID);
    board.empty();
    for (let r = 0; r < row; r++) {
        board.append(`<div class="tetris-row d-flex justify-content-end" id="tetris-row-${r}"></div>`);
        for (let c = col; c > 0; c--) {
            $(`#tetris-row-${r}`).append(`<div class="tetris-col tetris-col-${c - 1}"></div>`);
        }
        BITS_FIXED.push(0);
    }
}

function displayNextBlock() {
    let nextBlock = $('#tetris-next-block');
    nextBlock.empty();
    for (let r = 0; r < NEXT_BLOCK.row; r++) {
        nextBlock.append(`<div class="tetris-row d-flex justify-content-center" id="tetris-next-row-${r}"></div>`);
        for (let c = NEXT_BLOCK.col; c > 0; c--) {
            if ((NEXT_BLOCK.bits[r] >> c - 1) & 1) {
                $(`#tetris-next-row-${r}`).append(`<div class="tetris-col ${CELL_STATUS_NEXT_FIXED}"></div>`);
            } else {
                $(`#tetris-next-row-${r}`).append(`<div class="tetris-col ${CELL_STATUS_EMPTY}"></div>`);
            }
        }
    }
}

function getCell(row, col) {
    if (row >= ROW || col >= COL) {
        throw new Error('row or column number is out of the range.');
    }
    return $(`${BOARD_ID} #tetris-row-${row} .tetris-col-${col}`);
}

function clearFixedCells() {
    $(`.${CELL_STATUS_FIXED},.${CELL_STATUS_CANCEL}`).each(function () {
        $(this).removeClass(`${CELL_STATUS_FIXED} ${CELL_STATUS_CANCEL}`);
    });
}

function clearMovingCells() {
    $(`.${CELL_STATUS_MOVING}`).each(function () {
        $(this).removeClass(CELL_STATUS_MOVING);
    });
}

function displayFixedCells() {
    for (let r = 0; r < ROW; r++) {
        if (BITS_FIXED[r] === 0) continue;
        for (let c = 0; c < COL; c++) {
            if ((BITS_FIXED[r] >> c) & 1) {
                setCellStatus(r, c, CELL_STATUS_FIXED);
            }
        }
    }
}

function displayMovingBlock(topPadding, rightPadding, block) {
    for (let r = 0; r < block.row; r++) {
        for (let c = 0; c < block.col; c++) {
            if ((block.bits[r] >> c) & 1) {
                setCellStatus(r + topPadding, c + rightPadding, CELL_STATUS_MOVING);
            }
        }
    }
}

function updateMovingBlock() {
    clearMovingCells();
    displayMovingBlock(TOP_PADDING, RIGHT_PADDING, BLOCK);
}

function updateFixedCells() {
    clearFixedCells();
    displayFixedCells();
}

function displayGamePoints(points = GAME_POINTS) {
    $('#tetris-points').text(points.toString().padStart(5, '0'));
}

function displayGameLevel(level = GAME_LEVEL) {
    $('#tetris-level').text(level);
}

function setCellStatus(row, col, status = CELL_STATUS_EMPTY) {
    return getCell(row, col)
        .removeClass(`${CELL_STATUS_EMPTY} 
        ${CELL_STATUS_FIXED} 
        ${CELL_STATUS_CANCEL} 
        ${CELL_STATUS_MOVING}`)
        .addClass(status);
}

function setRowStatus(row, status = CELL_STATUS_EMPTY) {
    for (let i = 0; i < COL; i++) {
        setCellStatus(row, i, status);
    }
}

/**************************************
 * CONTROLLER
 **************************************/
function bindKeyStrokes() {
    $(document).keydown(e => {
        switch (e.which) {
            case 13: // ENTER
                pauseGame();
                break;
            case 32: // space
                rotateBlock();
                break;
            case 37: // left arrow
                moveLeft();
                break;
            case 38: // up arrow
                rotateBlock();
                break;
            case 39: // right arrow
                moveRight();
                break;
            case 40: // down arrow
                moveDown();
                break;
            default:
                break;
        }
        e.preventDefault();
    });
}

function bindGestures() {
    let hammer = new Hammer(document.getElementsByTagName('body')[0]);

    hammer.get('swipe').set({direction: Hammer.DIRECTION_ALL});
    hammer.on('swipeleft', moveLeft);
    hammer.on('swiperight', moveRight);
    hammer.on('swipedown', moveDown);
    hammer.on('swipeup', rotateBlock);
    hammer.on('doubletap', pauseGame);
}

function initControllers() {
    bindKeyStrokes();
    bindGestures();
}

function stopTimer() {
    clearInterval(GAME_STEP_TIMER);
}

function setUpTimer(interval = GAME_INTERVAL) {
    GAME_STEP_TIMER = setInterval(() => {
        moveDown();
    }, interval);
}

function pauseGame() {
    if (!GAME_PAUSED) {
        waitAndLockMutex(() => {
            GAME_PAUSED = true;
            stopTimer();
            printLog('Game has been paused.');
        });
    } else {
        GAME_PAUSED = false;
        setUpTimer();
        printLog('Game has been resumed.');
        unlockMutex();
    }

}

function moveLeft() {
    lockMutex(() => {
        if (isMovable(TOP_PADDING, RIGHT_PADDING + 1, BLOCK)) {
            RIGHT_PADDING += 1;
            printMovementLog('left');
            updateMovingBlock();
        }
        printMovementLog('left', 0);
    });
}

function moveRight() {
    lockMutex(() => {
        if (isMovable(TOP_PADDING, RIGHT_PADDING - 1, BLOCK)) {
            RIGHT_PADDING -= 1;
            printMovementLog('right');
            updateMovingBlock();
        }
        printMovementLog('right', 0);
    })
}

function moveDown() {
    lockMutex(() => {
        if (isMovable(TOP_PADDING + 1, RIGHT_PADDING, BLOCK)) {
            TOP_PADDING += 1;
            printMovementLog('down');
            updateMovingBlock();
        } else {
            fixBlock(TOP_PADDING, RIGHT_PADDING, BLOCK);
            updateFixedCells();
            printLog(`${BLOCK.name} touched the bottom.`);
            eliminateFullRows();
            initBlock();
            displayNextBlock();
        }
    });
}

function rotateBlock() {
    lockMutex(() => {
        if (isMovable(TOP_PADDING, RIGHT_PADDING, blocks[BLOCK.index][BLOCK.next])) {
            BLOCK = blocks[BLOCK.index][BLOCK.next];
            printLog(`Rotate block to ${BLOCK.name}`);
        } else {
            printLog(`Failed to rotate block ${BLOCK.name}`);
        }
    });
}

function eliminateFullRows() {
    let fullRows = getFullRows();
    fullRows.forEach(row => setRowStatus(row, CELL_STATUS_CANCEL));
    setTimeout(() => {
        BITS_FIXED = BITS_FIXED.filter((bits, index) => {
            if (!fullRows.includes(index)) {
                return true;
            } else {
                printLog(`Eliminated row-${index}.`);
                return false;
            }
        });
        BITS_FIXED = fullRows.map(() => 0).concat(BITS_FIXED);
        updateFixedCells();
    }, GAME_INTERVAL / 4);
    if (fullRows.length > 0) {
        updateGamePoints(fullRows.length);
    }
}

function speedUpGame() {
    GAME_LEVEL += 1;
    stopTimer();
    GAME_INTERVAL = 800 * Math.pow(0.9, GAME_LEVEL);
    setUpTimer();
}

function updateGamePoints(combo = 1) {
    let gained = Math.round(100 * (combo + (combo - 1) * 0.1));
    GAME_POINTS += gained;
    printLog(`Gained ${gained}pts to total ${GAME_POINTS}pts.`);
    if (GAME_POINTS >= (GAME_LEVEL + 1) * 1000) {
        speedUpGame();
        printLog(`Leveled up to ${GAME_LEVEL}, step interval decreased to ${GAME_INTERVAL}`);
        displayGameLevel();
    }
    displayGamePoints();
}

function initGame() {
    initGamePoints();
    initGameLevel();
    GAME_INTERVAL = 800;
    initBoard(ROW, COL);
    initBlock();
    displayNextBlock();
    initControllers();
    pauseGame();
}

$(document).ready(() => {
    $('.background-img').backstretch('image/bg1.jpg');
    initGame();
});