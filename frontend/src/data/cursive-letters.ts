/**
 * Cursive letter SVG paths.
 * Coordinate system: viewBox 0 0 200 200
 * Baseline ≈ y=130, midline ≈ y=85, top ≈ y=35, descender ≈ y=175
 * Each letter has one or more strokes. Multiple strokes drawn in order.
 */

export interface CursiveLetter {
  char: string;
  case: 'lower' | 'upper';
  strokes: string[]; // Each entry is an SVG path "d" string
  startDot?: { x: number; y: number };
  description?: string;
}

const LOWERCASE: CursiveLetter[] = [
  {
    char: 'a',
    case: 'lower',
    strokes: [
      'M 110 90 C 70 80 50 130 80 135 C 110 140 130 110 110 90 L 110 130 C 115 140 130 140 145 130',
    ],
    startDot: { x: 110, y: 90 },
  },
  {
    char: 'b',
    case: 'lower',
    strokes: [
      'M 60 130 C 60 100 65 60 80 45 C 90 35 100 45 90 70 L 75 130 C 80 140 100 130 110 110 C 120 90 100 75 80 95',
    ],
    startDot: { x: 60, y: 130 },
  },
  {
    char: 'c',
    case: 'lower',
    strokes: [
      'M 130 95 C 110 75 70 80 65 110 C 60 140 110 145 135 125',
    ],
    startDot: { x: 130, y: 95 },
  },
  {
    char: 'd',
    case: 'lower',
    strokes: [
      'M 120 95 C 95 80 65 95 70 125 C 75 145 110 140 120 120 L 130 50 C 135 45 145 50 140 65 L 120 130 C 125 140 140 140 155 130',
    ],
    startDot: { x: 120, y: 95 },
  },
  {
    char: 'e',
    case: 'lower',
    strokes: [
      'M 70 115 L 115 110 C 125 100 115 85 100 90 C 75 95 65 130 90 138 C 110 142 130 130 145 115',
    ],
    startDot: { x: 70, y: 115 },
  },
  {
    char: 'f',
    case: 'lower',
    strokes: [
      'M 90 130 C 95 100 100 60 110 45 C 120 35 130 50 120 70 L 95 130 L 90 160 C 85 175 70 175 65 165 C 62 158 70 152 80 152 L 130 130',
    ],
    startDot: { x: 90, y: 130 },
  },
  {
    char: 'g',
    case: 'lower',
    strokes: [
      'M 115 90 C 80 85 60 130 90 138 C 115 140 130 115 115 90 L 115 145 C 110 175 80 180 70 165 C 65 155 80 150 95 155',
    ],
    startDot: { x: 115, y: 90 },
  },
  {
    char: 'h',
    case: 'lower',
    strokes: [
      'M 60 130 C 60 100 65 60 80 45 C 90 35 100 45 90 70 L 75 130 C 80 105 100 90 115 100 C 130 110 115 130 125 138 C 135 140 145 132 155 122',
    ],
    startDot: { x: 60, y: 130 },
  },
  {
    char: 'i',
    case: 'lower',
    strokes: [
      'M 80 100 C 90 115 90 125 95 138 C 105 140 120 130 135 115',
      'M 95 70 L 95 75',
    ],
    startDot: { x: 80, y: 100 },
  },
  {
    char: 'j',
    case: 'lower',
    strokes: [
      'M 100 95 C 105 115 105 145 100 165 C 95 178 75 178 70 168 C 67 160 75 155 85 156',
      'M 105 70 L 105 75',
    ],
    startDot: { x: 100, y: 95 },
  },
  {
    char: 'k',
    case: 'lower',
    strokes: [
      'M 60 130 C 60 100 65 60 80 45 C 90 35 100 45 90 70 L 75 130 C 90 110 110 100 120 105 C 105 115 95 125 110 130 C 125 135 130 130 145 120',
    ],
    startDot: { x: 60, y: 130 },
  },
  {
    char: 'l',
    case: 'lower',
    strokes: [
      'M 70 130 C 70 100 75 60 90 45 C 100 35 110 45 100 70 L 80 130 C 85 140 105 140 125 125',
    ],
    startDot: { x: 70, y: 130 },
  },
  {
    char: 'm',
    case: 'lower',
    strokes: [
      'M 50 130 C 50 110 60 90 70 95 C 80 100 75 130 80 138 C 85 130 95 95 105 95 C 115 100 110 130 115 138 C 120 130 130 95 140 95 C 150 100 145 130 150 138 C 155 138 165 130 170 122',
    ],
    startDot: { x: 50, y: 130 },
  },
  {
    char: 'n',
    case: 'lower',
    strokes: [
      'M 60 130 C 60 110 70 90 80 95 C 90 100 85 130 90 138 C 95 130 105 95 120 95 C 130 100 125 130 130 138 C 140 138 150 130 160 122',
    ],
    startDot: { x: 60, y: 130 },
  },
  {
    char: 'o',
    case: 'lower',
    strokes: [
      'M 115 95 C 80 85 65 130 90 138 C 115 140 135 115 120 95 C 115 90 110 90 110 92 L 130 100 C 140 105 150 100 160 92',
    ],
    startDot: { x: 115, y: 95 },
  },
  {
    char: 'p',
    case: 'lower',
    strokes: [
      'M 60 100 C 70 95 75 110 70 130 L 65 165 C 70 175 75 170 80 160 L 90 110 C 100 90 130 90 130 110 C 130 130 100 145 80 130',
    ],
    startDot: { x: 60, y: 100 },
  },
  {
    char: 'q',
    case: 'lower',
    strokes: [
      'M 115 90 C 80 85 60 130 90 138 C 115 140 130 115 115 90 L 115 145 C 115 165 125 175 140 175 C 130 170 130 160 138 160',
    ],
    startDot: { x: 115, y: 90 },
  },
  {
    char: 'r',
    case: 'lower',
    strokes: [
      'M 60 130 C 70 110 75 95 85 90 C 95 92 90 105 80 110 C 95 105 110 100 125 105 C 115 115 115 125 125 138 C 135 138 145 130 155 122',
    ],
    startDot: { x: 60, y: 130 },
  },
  {
    char: 's',
    case: 'lower',
    strokes: [
      'M 130 95 C 115 80 90 85 85 105 C 80 125 130 115 125 135 C 120 145 95 145 80 130 L 130 130 C 140 130 150 122 155 115',
    ],
    startDot: { x: 130, y: 95 },
  },
  {
    char: 't',
    case: 'lower',
    strokes: [
      'M 95 50 L 80 130 C 85 140 100 140 115 130',
      'M 75 90 L 115 85',
    ],
    startDot: { x: 95, y: 50 },
  },
  {
    char: 'u',
    case: 'lower',
    strokes: [
      'M 60 95 C 60 115 65 135 80 138 C 95 140 105 125 110 110 L 105 95 C 105 115 110 135 120 138 C 135 140 145 130 155 120',
    ],
    startDot: { x: 60, y: 95 },
  },
  {
    char: 'v',
    case: 'lower',
    strokes: [
      'M 60 95 C 65 115 75 135 90 138 C 105 135 115 105 125 90 C 130 95 135 100 145 100 C 150 100 155 95 160 92',
    ],
    startDot: { x: 60, y: 95 },
  },
  {
    char: 'w',
    case: 'lower',
    strokes: [
      'M 50 95 C 55 115 65 135 75 138 C 85 135 90 115 95 100 C 100 115 105 135 115 138 C 125 135 130 115 140 95 C 145 100 150 100 160 92',
    ],
    startDot: { x: 50, y: 95 },
  },
  {
    char: 'x',
    case: 'lower',
    strokes: [
      'M 70 90 C 100 110 130 130 145 138',
      'M 145 90 C 130 100 100 130 70 138',
    ],
    startDot: { x: 70, y: 90 },
  },
  {
    char: 'y',
    case: 'lower',
    strokes: [
      'M 60 95 C 65 115 75 135 90 138 C 105 135 110 110 115 95 C 115 115 115 145 110 165 C 105 178 85 178 78 168 C 75 160 85 155 95 156',
    ],
    startDot: { x: 60, y: 95 },
  },
  {
    char: 'z',
    case: 'lower',
    strokes: [
      'M 70 90 L 130 90 L 70 138 L 130 138 C 145 138 150 130 155 122',
    ],
    startDot: { x: 70, y: 90 },
  },
];

const UPPERCASE: CursiveLetter[] = [
  {
    char: 'A',
    case: 'upper',
    strokes: [
      'M 50 145 C 65 100 90 50 110 35 C 120 30 125 40 130 60 L 145 145 M 70 110 L 135 110',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'B',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 70 65 85 40 C 95 35 105 45 100 60 L 75 145 M 80 75 C 110 70 140 75 140 95 C 140 110 110 110 95 105 M 95 105 C 130 105 155 115 150 130 C 145 145 110 150 80 140',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'C',
    case: 'upper',
    strokes: [
      'M 155 60 C 130 35 80 40 65 80 C 50 120 95 160 145 145 C 130 145 130 135 138 130',
    ],
    startDot: { x: 155, y: 60 },
  },
  {
    char: 'D',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 70 65 90 40 C 100 35 110 45 105 60 L 80 145 C 110 150 155 140 160 100 C 160 60 130 50 95 65',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'E',
    case: 'upper',
    strokes: [
      'M 155 50 C 130 30 90 40 75 75 C 65 105 75 145 105 150 C 130 150 145 140 155 130 M 80 95 L 120 95',
    ],
    startDot: { x: 155, y: 50 },
  },
  {
    char: 'F',
    case: 'upper',
    strokes: [
      'M 60 145 C 75 110 90 65 110 40 C 120 35 130 45 125 60 L 100 145 C 95 160 80 155 70 145 M 75 90 L 130 85',
    ],
    startDot: { x: 60, y: 145 },
  },
  {
    char: 'G',
    case: 'upper',
    strokes: [
      'M 155 60 C 130 35 80 40 65 80 C 50 120 95 160 145 145 L 145 110 L 110 110',
    ],
    startDot: { x: 155, y: 60 },
  },
  {
    char: 'H',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 70 65 90 40 C 100 35 110 45 100 60 L 75 145 M 130 50 C 140 45 150 50 145 65 L 120 145 M 80 95 L 140 90',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'I',
    case: 'upper',
    strokes: [
      'M 70 50 C 90 45 110 50 105 65 L 90 130 C 85 145 100 155 115 145',
    ],
    startDot: { x: 70, y: 50 },
  },
  {
    char: 'J',
    case: 'upper',
    strokes: [
      'M 130 50 C 140 45 150 50 140 65 L 115 150 C 105 175 80 175 70 160 C 65 150 80 145 95 150',
    ],
    startDot: { x: 130, y: 50 },
  },
  {
    char: 'K',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 70 65 90 40 C 100 35 110 45 100 60 L 75 145 M 145 50 C 130 80 110 100 90 110 M 100 105 C 115 115 130 130 145 145',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'L',
    case: 'upper',
    strokes: [
      'M 60 130 C 80 90 100 50 120 40 C 130 38 135 50 125 65 L 90 130 C 95 145 120 150 145 140',
    ],
    startDot: { x: 60, y: 130 },
  },
  {
    char: 'M',
    case: 'upper',
    strokes: [
      'M 40 145 C 50 110 65 65 80 45 C 90 40 95 55 90 70 L 75 145 M 75 145 C 85 110 95 75 110 60 C 120 60 120 75 115 90 L 100 145 M 100 145 C 110 115 120 80 135 65 C 145 60 150 75 145 90 L 145 145',
    ],
    startDot: { x: 40, y: 145 },
  },
  {
    char: 'N',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 70 65 85 45 C 95 40 100 55 95 70 L 80 145 C 95 115 120 75 140 50 C 150 45 155 55 150 70 L 130 145',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'O',
    case: 'upper',
    strokes: [
      'M 130 45 C 90 30 50 70 60 110 C 70 150 130 160 155 130 C 170 105 165 60 130 45',
    ],
    startDot: { x: 130, y: 45 },
  },
  {
    char: 'P',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 75 65 95 40 C 105 35 110 45 105 60 L 80 145 M 90 75 C 130 65 160 75 155 100 C 150 120 110 125 85 110',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'Q',
    case: 'upper',
    strokes: [
      'M 130 45 C 90 30 50 70 60 110 C 70 150 130 160 155 130 C 170 105 165 60 130 45 M 130 130 L 165 165',
    ],
    startDot: { x: 130, y: 45 },
  },
  {
    char: 'R',
    case: 'upper',
    strokes: [
      'M 50 145 C 60 110 70 65 90 40 C 100 35 110 45 100 60 L 75 145 M 80 75 C 120 70 150 80 145 100 C 140 115 110 115 90 110 M 100 110 C 115 120 130 130 150 145',
    ],
    startDot: { x: 50, y: 145 },
  },
  {
    char: 'S',
    case: 'upper',
    strokes: [
      'M 155 60 C 140 35 100 30 80 50 C 60 75 90 95 115 100 C 145 110 160 130 145 145 C 120 160 80 150 65 130',
    ],
    startDot: { x: 155, y: 60 },
  },
  {
    char: 'T',
    case: 'upper',
    strokes: [
      'M 50 50 C 80 35 130 40 155 55 M 105 50 L 90 130 C 85 145 100 155 115 145',
    ],
    startDot: { x: 50, y: 50 },
  },
  {
    char: 'U',
    case: 'upper',
    strokes: [
      'M 50 50 C 60 90 60 140 90 145 C 115 145 125 110 125 75 L 130 50 C 145 45 155 60 145 80 L 135 145',
    ],
    startDot: { x: 50, y: 50 },
  },
  {
    char: 'V',
    case: 'upper',
    strokes: [
      'M 50 50 C 65 95 80 130 100 145 C 110 140 125 95 145 50',
    ],
    startDot: { x: 50, y: 50 },
  },
  {
    char: 'W',
    case: 'upper',
    strokes: [
      'M 35 50 C 45 90 55 130 70 145 C 80 135 90 95 100 65 C 105 100 115 130 125 145 C 140 135 155 90 165 50',
    ],
    startDot: { x: 35, y: 50 },
  },
  {
    char: 'X',
    case: 'upper',
    strokes: [
      'M 55 50 C 90 90 125 130 150 145 M 150 50 C 130 70 100 110 60 145',
    ],
    startDot: { x: 55, y: 50 },
  },
  {
    char: 'Y',
    case: 'upper',
    strokes: [
      'M 55 50 C 70 80 90 110 100 130 L 100 165 C 95 178 75 178 65 168 M 145 50 C 130 80 110 110 100 130',
    ],
    startDot: { x: 55, y: 50 },
  },
  {
    char: 'Z',
    case: 'upper',
    strokes: [
      'M 60 55 C 90 45 130 45 150 60 L 60 145 C 90 145 130 145 155 135',
    ],
    startDot: { x: 60, y: 55 },
  },
];

export const ALL_LETTERS: CursiveLetter[] = [...LOWERCASE, ...UPPERCASE];

export const getLetter = (char: string): CursiveLetter | undefined => {
  return ALL_LETTERS.find((l) => l.char === char);
};

export const PRACTICE_WORDS = [
  'love',
  'hope',
  'silence',
  'memory',
  'gratitude',
  'breathe',
  'still',
  'become',
];

export const PRACTICE_SENTENCES = [
  'Begin again, slowly.',
  'I am here, and that is enough.',
  'Tend to small things.',
];
