const blocks = [
    [
        {
            bits: [0b10, 0b111],
            row: 2,
            col: 3,
            index: 0,
            next: 1,
            name: 'b0-0',
        },
        {
            bits: [0b10, 0b11, 0b10],
            row: 3,
            col: 2,
            index: 0,
            next: 2,
            name: 'b0-1',
        },
        {
            bits: [0b111, 0b10],
            row: 2,
            col: 3,
            index: 0,
            next: 3,
            name: 'b0-2',

        },
        {
            bits: [0b1, 0b11, 0b1],
            row: 3,
            col: 2,
            index: 0,
            next: 0,
            name: 'b0-3',
        }
    ],
    [
        {
            bits: [0b11, 0b11],
            row: 2,
            col: 2,
            index: 1,
            next: 0,
            name: 'b1-0',
        }
    ],
    [
        {
            bits: [0b111, 0b100],
            row: 2,
            col: 3,
            index: 2,
            next: 1,
            name: 'b2-0',
        },
        {
            bits: [0b11, 0b1, 0b1],
            row: 3,
            col: 2,
            index: 2,
            next: 2,
            name: 'b2-1',
        },
        {
            bits: [0b1, 0b111],
            row: 2,
            col: 3,
            index: 2,
            next: 3,
            name: 'b2-2',
        },
        {
            bits: [0b10, 0b10, 0b11],
            row: 3,
            col: 2,
            index: 2,
            next: 0,
            name: 'b2-3',
        }
    ],
    [
        {
            bits: [0b111, 0b1],
            row: 2,
            col: 3,
            index: 3,
            next: 1,
            name: 'b3-0',
        },
        {
            bits: [0b1, 0b1, 0b11],
            row: 3,
            col: 2,
            index: 3,
            next: 2,
            name: 'b3-1',
        },
        {
            bits: [0b100, 0b111],
            row: 2,
            col: 3,
            index: 3,
            next: 3,
            name: 'b3-2',
        },
        {
            bits: [0b11, 0b10, 0b10],
            row: 3,
            col: 2,
            index: 3,
            next: 0,
            name: 'b3-3',
        }
    ],
    [
        {
            bits: [0b10, 0b11, 0b1],
            row: 3,
            col: 2,
            index: 4,
            next: 1,
            name: 'b4-0',
        },
        {
            bits: [0b11, 0b110],
            row: 2,
            col: 3,
            index: 4,
            next: 0,
            name: 'b4-1',
        }
    ],
    [
        {
            bits: [0b1, 0b11, 0b10],
            row: 3,
            col: 2,
            index: 5,
            next: 1,
            name: 'b5-0',
        },
        {
            bits: [0b110, 0b11],
            row: 2,
            col: 3,
            index: 5,
            next: 0,
            name: 'b5-1',
        }
    ],
    [
        {
            bits: [0b1, 0b1, 0b1, 0b1],
            row: 4,
            col: 1,
            index: 6,
            next: 1,
            name: 'b6-0',
        },
        {
            bits: [0b1111],
            row: 1,
            col: 4,
            index: 6,
            next: 0,
            name: 'b6-1',
        }
    ]
];

