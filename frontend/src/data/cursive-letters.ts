/**
 * Authentic Palmer Method (1888) cursive letter forms.
 *
 * Each letter is a sequence of discrete pen-strokes, drawn according to
 * the proportional system used in 19th-century American penmanship manuals:
 *
 *   ViewBox: 280 × 240
 *   Ascender top:  y =  30
 *   Headline:      y = 110   (top of x-height / waistline)
 *   Baseline:      y = 190
 *   Descender:     y = 225
 *
 *   Slant: 12° from vertical (applied at render time via skewX transform)
 *
 * Each stroke records its start point so a numbered marker can be drawn
 * on the practice canvas, and a `direction` tag so directional arrows
 * may be rendered along the path.
 */

export type LetterCase = 'lower' | 'upper';
export type LetterHeight = 'minimum' | 'ascender' | 'descender' | 'capital';
export type StrokeDirection = 'undercurve' | 'overcurve' | 'downstroke' | 'upstroke' | 'oval' | 'loop' | 'cross' | 'dot' | 'connector' | 'descender';

export interface LetterStroke {
  d: string;
  start: { x: number; y: number };
  direction: StrokeDirection;
  /** A tiny instructional name. */
  name: string;
}

export interface CursiveLetter {
  char: string;
  case: LetterCase;
  height: LetterHeight;
  strokes: LetterStroke[];
  cue: string;
  description: string;
}

export const VIEWBOX = { width: 280, height: 240 };
export const GUIDES = {
  ascenderTop: 30,
  headline: 110,
  baseline: 190,
  descenderBottom: 225,
};
export const SLANT_DEGREES = 12;

const stroke = (
  d: string,
  start: { x: number; y: number },
  direction: StrokeDirection,
  name: string,
): LetterStroke => ({ d, start, direction, name });

// --- LOWERCASE ---------------------------------------------------------------
const LOWERCASE: CursiveLetter[] = [
  {
    char: 'a',
    case: 'lower',
    height: 'minimum',
    cue: 'Undercurve in. Counterclockwise oval. Down. Out.',
    description: 'The first minimum letter. Close the oval at the top.',
    strokes: [
      stroke(
        'M 95 188 C 110 172, 135 138, 152 118 C 142 108, 100 112, 95 145 C 90 180, 132 198, 156 178 C 162 152, 160 122, 152 118 L 158 188 C 175 195, 200 188, 220 176',
        { x: 95, y: 188 },
        'undercurve',
        'undercurve · oval · downstroke · out',
      ),
    ],
  },
  {
    char: 'b',
    case: 'lower',
    height: 'ascender',
    cue: 'Undercurve up. Loop above. Down. Bowl. Exit at the headline.',
    description: 'Exit b at the headline — never the baseline.',
    strokes: [
      stroke(
        'M 95 188 C 110 170, 130 130, 110 70 C 100 45, 80 38, 80 60 C 82 90, 115 130, 108 188 C 130 200, 160 188, 168 168 C 175 145, 162 132, 142 142 C 165 152, 195 158, 215 148',
        { x: 95, y: 188 },
        'loop',
        'tall loop · downstroke · bowl · check exit',
      ),
    ],
  },
  {
    char: 'c',
    case: 'lower',
    height: 'minimum',
    cue: 'Overcurve in. Open backward bowl. Out.',
    description: 'Leave the curve open on the right.',
    strokes: [
      stroke(
        'M 192 130 C 175 112, 130 108, 105 132 C 80 158, 95 188, 132 192 C 165 196, 198 184, 220 172',
        { x: 192, y: 130 },
        'overcurve',
        'overcurve · backward bowl · out',
      ),
    ],
  },
  {
    char: 'd',
    case: 'lower',
    height: 'ascender',
    cue: 'Oval. Stem to the ascender. Downstroke. Out.',
    description: 'A short oval, then a tall stem.',
    strokes: [
      stroke(
        'M 95 188 C 110 172, 132 138, 148 118 C 138 108, 95 112, 92 145 C 88 180, 130 198, 154 178 C 160 150, 162 122, 158 118 C 162 102, 172 60, 178 50 C 184 42, 178 50, 174 65 L 168 188 C 188 198, 215 188, 232 175',
        { x: 95, y: 188 },
        'oval',
        'oval · ascender stem · downstroke · out',
      ),
    ],
  },
  {
    char: 'e',
    case: 'lower',
    height: 'minimum',
    cue: 'Undercurve into a small loop. Out.',
    description: 'A tidy, deliberate loop.',
    strokes: [
      stroke(
        'M 95 188 C 108 175, 122 158, 145 145 C 168 138, 152 112, 130 128 C 112 142, 105 168, 130 188 C 162 196, 195 188, 218 174',
        { x: 95, y: 188 },
        'loop',
        'undercurve · loop · out',
      ),
    ],
  },
  {
    char: 'f',
    case: 'lower',
    height: 'descender',
    cue: 'Up loop. Down through baseline. Lower loop. Cross. Out.',
    description: 'Two loops drawn in one breath.',
    strokes: [
      stroke(
        'M 105 188 C 105 145, 110 90, 128 50 C 138 35, 132 38, 124 50 C 110 90, 92 145, 100 200 C 102 218, 90 226, 76 218 C 65 210, 80 202, 100 202 C 122 200, 138 198, 158 192 C 178 188, 195 184, 212 178',
        { x: 105, y: 188 },
        'loop',
        'tall loop · descender loop · cross · out',
      ),
    ],
  },
  {
    char: 'g',
    case: 'lower',
    height: 'descender',
    cue: 'Oval. Down past the baseline. Loop. Out.',
    description: 'The descender loop crosses at the baseline.',
    strokes: [
      stroke(
        'M 95 188 C 110 172, 135 138, 152 118 C 142 108, 100 112, 95 145 C 90 180, 132 198, 156 178 C 162 152, 160 122, 152 118 L 162 215 C 168 225, 130 230, 102 225 C 78 220, 88 200, 130 200 C 165 196, 198 188, 220 175',
        { x: 95, y: 188 },
        'oval',
        'oval · descender loop · out',
      ),
    ],
  },
  {
    char: 'h',
    case: 'lower',
    height: 'ascender',
    cue: 'Tall loop. Arch. Out.',
    description: 'A loop, then a single arch — like the top of an n.',
    strokes: [
      stroke(
        'M 95 188 C 110 170, 130 130, 110 70 C 100 45, 80 38, 80 60 C 82 90, 115 130, 108 188 C 115 158, 132 130, 152 130 C 172 130, 178 148, 168 188 C 180 198, 205 188, 222 175',
        { x: 95, y: 188 },
        'loop',
        'tall loop · arch · out',
      ),
    ],
  },
  {
    char: 'i',
    case: 'lower',
    height: 'minimum',
    cue: 'Undercurve. Down. Out. Lift. Dot above.',
    description: 'The dot is added last, after the stroke is at rest.',
    strokes: [
      stroke(
        'M 95 188 C 110 170, 130 138, 130 118 L 142 188 C 162 198, 188 188, 210 175',
        { x: 95, y: 188 },
        'undercurve',
        'undercurve · downstroke · out',
      ),
      stroke(
        'M 138 88 C 142 86, 144 88, 142 92 C 140 95, 136 94, 136 90 Z',
        { x: 138, y: 88 },
        'dot',
        'dot above',
      ),
    ],
  },
  {
    char: 'j',
    case: 'lower',
    height: 'descender',
    cue: 'Undercurve. Down past baseline. Loop. Lift. Dot above.',
    description: 'Loop low; dot last.',
    strokes: [
      stroke(
        'M 95 188 C 110 170, 130 138, 128 118 C 132 145, 138 180, 142 215 C 142 225, 105 230, 82 222 C 70 215, 85 208, 108 210',
        { x: 95, y: 188 },
        'undercurve',
        'undercurve · downstroke · descender loop',
      ),
      stroke(
        'M 138 88 C 142 86, 144 88, 142 92 C 140 95, 136 94, 136 90 Z',
        { x: 138, y: 88 },
        'dot',
        'dot above',
      ),
    ],
  },
  {
    char: 'k',
    case: 'lower',
    height: 'ascender',
    cue: 'Tall loop. Down. Knot at midline. Leg out.',
    description: 'A small horizontal loop at the heart of the letter.',
    strokes: [
      stroke(
        'M 95 188 C 110 170, 130 130, 110 70 C 100 45, 80 38, 80 60 C 82 90, 115 130, 108 188 C 115 165, 130 145, 145 142 C 162 142, 158 158, 142 162 C 152 168, 165 180, 158 188 C 175 198, 200 188, 222 175',
        { x: 95, y: 188 },
        'loop',
        'tall loop · downstroke · knot · leg out',
      ),
    ],
  },
  {
    char: 'l',
    case: 'lower',
    height: 'ascender',
    cue: 'Undercurve. Loop to the ascender. Down. Out.',
    description: 'Tall, slender, unhurried.',
    strokes: [
      stroke(
        'M 95 188 C 110 170, 130 130, 110 70 C 100 45, 80 38, 80 60 C 82 90, 130 138, 132 188 C 150 198, 178 188, 200 175',
        { x: 95, y: 188 },
        'loop',
        'tall loop · downstroke · out',
      ),
    ],
  },
  {
    char: 'm',
    case: 'lower',
    height: 'minimum',
    cue: 'Three arches. Equal height. Out.',
    description: 'Three peaks of the same height — the rhythm is the lesson.',
    strokes: [
      stroke(
        'M 80 188 C 88 168, 92 132, 100 118 C 108 138, 115 162, 118 188 C 124 168, 132 132, 140 118 C 148 138, 155 162, 158 188 C 164 168, 172 132, 180 118 C 188 138, 195 162, 198 188 C 212 198, 232 188, 248 175',
        { x: 80, y: 188 },
        'overcurve',
        'three arches · out',
      ),
    ],
  },
  {
    char: 'n',
    case: 'lower',
    height: 'minimum',
    cue: 'Two arches. Equal height. Out.',
    description: 'The same rhythm as m, less one peak.',
    strokes: [
      stroke(
        'M 85 188 C 92 168, 96 132, 105 118 C 113 138, 120 162, 122 188 C 128 168, 138 132, 148 118 C 156 138, 162 162, 165 188 C 178 198, 200 188, 218 175',
        { x: 85, y: 188 },
        'overcurve',
        'two arches · out',
      ),
    ],
  },
  {
    char: 'o',
    case: 'lower',
    height: 'minimum',
    cue: 'Counterclockwise oval. Check at the top.',
    description: 'Exit at the headline so o joins the next letter.',
    strokes: [
      stroke(
        'M 95 188 C 108 172, 132 138, 148 118 C 132 108, 92 112, 88 145 C 84 180, 128 198, 152 178 C 162 152, 158 120, 148 118 C 158 108, 178 105, 195 100 C 210 98, 220 100, 228 105',
        { x: 95, y: 188 },
        'oval',
        'oval · check exit at headline',
      ),
    ],
  },
  {
    char: 'p',
    case: 'lower',
    height: 'descender',
    cue: 'Down past baseline. Up. Bowl. Out.',
    description: 'Stem first, bowl second.',
    strokes: [
      stroke(
        'M 95 130 C 100 158, 105 195, 110 218 C 112 222, 116 220, 118 215 C 122 188, 128 150, 130 128 C 142 105, 175 108, 180 138 C 182 168, 145 178, 128 170 C 138 178, 152 188, 178 188 C 200 192, 218 185, 232 175',
        { x: 95, y: 130 },
        'descender',
        'descender · upstroke · bowl · out',
      ),
    ],
  },
  {
    char: 'q',
    case: 'lower',
    height: 'descender',
    cue: 'Oval. Down past baseline. Curl right.',
    description: 'The curl turns toward the next letter.',
    strokes: [
      stroke(
        'M 95 188 C 110 172, 135 138, 152 118 C 142 108, 100 112, 95 145 C 90 180, 132 198, 156 178 C 162 152, 160 122, 152 118 L 162 215 C 175 222, 200 218, 215 208 C 222 200, 218 195, 210 200',
        { x: 95, y: 188 },
        'oval',
        'oval · descender · curl',
      ),
    ],
  },
  {
    char: 'r',
    case: 'lower',
    height: 'minimum',
    cue: 'Undercurve. Small shoulder. Down. Out.',
    description: 'A subtle shoulder — the most exacting of the minimum letters.',
    strokes: [
      stroke(
        'M 90 188 C 105 170, 128 138, 130 118 C 138 108, 152 110, 158 122 C 160 130, 158 138, 152 142 L 145 188 C 162 198, 188 188, 212 175',
        { x: 90, y: 188 },
        'undercurve',
        'undercurve · shoulder · down · out',
      ),
    ],
  },
  {
    char: 's',
    case: 'lower',
    height: 'minimum',
    cue: 'Up. Forward curve. Close at base.',
    description: 'A single, graceful s-curve.',
    strokes: [
      stroke(
        'M 92 188 C 108 172, 132 152, 142 132 C 152 115, 168 110, 162 124 C 152 138, 128 145, 118 158 C 108 175, 115 188, 138 190 C 168 195, 198 188, 218 175',
        { x: 92, y: 188 },
        'undercurve',
        'undercurve · forward curve · close',
      ),
    ],
  },
  {
    char: 't',
    case: 'lower',
    height: 'ascender',
    cue: 'Down. Out. Lift. Cross at the midline.',
    description: 'The crossbar is added last.',
    strokes: [
      stroke(
        'M 100 180 C 108 158, 122 122, 132 75 L 138 188 C 155 198, 180 188, 200 175',
        { x: 100, y: 180 },
        'downstroke',
        'downstroke · out',
      ),
      stroke(
        'M 105 100 C 130 96, 158 96, 175 100',
        { x: 105, y: 100 },
        'cross',
        'crossbar at midline',
      ),
    ],
  },
  {
    char: 'u',
    case: 'lower',
    height: 'minimum',
    cue: 'Two undercurves, joined.',
    description: 'The same rhythm, twice.',
    strokes: [
      stroke(
        'M 85 188 C 92 168, 100 138, 108 118 C 112 142, 118 175, 128 188 C 138 175, 145 142, 152 118 C 156 142, 162 175, 168 188 C 184 198, 208 188, 224 175',
        { x: 85, y: 188 },
        'undercurve',
        'two undercurves · out',
      ),
    ],
  },
  {
    char: 'v',
    case: 'lower',
    height: 'minimum',
    cue: 'Up. Down. Up. Check at the headline.',
    description: 'Exit at the headline, like o.',
    strokes: [
      stroke(
        'M 90 188 C 100 170, 108 138, 115 118 C 122 142, 132 175, 142 188 C 152 175, 158 142, 162 118 C 152 132, 162 110, 180 105 C 198 100, 215 102, 225 108',
        { x: 90, y: 188 },
        'undercurve',
        'undercurve · downstroke · check',
      ),
    ],
  },
  {
    char: 'w',
    case: 'lower',
    height: 'minimum',
    cue: 'Two undercurves. Check at the headline.',
    description: 'Two valleys, one breath.',
    strokes: [
      stroke(
        'M 75 188 C 82 170, 88 138, 95 118 C 102 142, 110 175, 118 188 C 128 175, 134 142, 140 118 C 146 142, 154 175, 162 188 C 172 175, 178 142, 184 118 C 175 132, 188 110, 205 105 C 222 100, 235 102, 245 108',
        { x: 75, y: 188 },
        'undercurve',
        'two undercurves · check',
      ),
    ],
  },
  {
    char: 'x',
    case: 'lower',
    height: 'minimum',
    cue: 'Diagonal up. Lift. Cross down.',
    description: 'Two strokes that meet at the centre.',
    strokes: [
      stroke(
        'M 90 188 C 108 172, 138 142, 175 118 C 185 115, 195 122, 200 132',
        { x: 90, y: 188 },
        'upstroke',
        'rising stroke',
      ),
      stroke(
        'M 105 122 C 138 142, 168 168, 195 188 C 212 196, 230 188, 240 178',
        { x: 105, y: 122 },
        'downstroke',
        'crossing stroke',
      ),
    ],
  },
  {
    char: 'y',
    case: 'lower',
    height: 'descender',
    cue: 'Two undercurves. Down past baseline. Loop.',
    description: 'A u with a descending loop.',
    strokes: [
      stroke(
        'M 85 188 C 92 168, 100 138, 108 118 C 112 142, 118 175, 128 188 C 138 175, 145 142, 152 118 L 162 215 C 165 225, 130 230, 102 225 C 78 220, 90 205, 130 205 C 162 200, 195 188, 218 175',
        { x: 85, y: 188 },
        'undercurve',
        'undercurve · descender loop',
      ),
    ],
  },
  {
    char: 'z',
    case: 'lower',
    height: 'descender',
    cue: 'Compound curve. Down. Loop. Out.',
    description: 'A small zig, then a descending loop.',
    strokes: [
      stroke(
        'M 102 130 C 122 110, 158 108, 175 122 L 102 188 L 168 192 L 162 215 C 158 225, 118 228, 95 220 C 78 212, 92 205, 122 205 C 152 200, 180 192, 200 180',
        { x: 102, y: 130 },
        'downstroke',
        'zig · descender loop',
      ),
    ],
  },
];

// --- UPPERCASE (selected, iconic Palmer capitals) ---------------------------
const UPPERCASE: CursiveLetter[] = [
  {
    char: 'A',
    case: 'upper',
    height: 'capital',
    cue: 'Curved up. Down. Loop. Exit at baseline.',
    description: 'A single-stroke flowing capital.',
    strokes: [
      stroke(
        'M 60 180 C 70 130, 95 70, 130 50 C 145 45, 152 60, 150 80 L 175 180 M 88 145 L 162 145',
        { x: 60, y: 180 },
        'upstroke',
        'curved up · down · crossbar',
      ),
    ],
  },
  {
    char: 'B',
    case: 'upper',
    height: 'capital',
    cue: 'Down. Two bowls. Out.',
    description: 'Two graceful bowls.',
    strokes: [
      stroke(
        'M 70 175 C 80 130, 90 70, 110 45 C 122 40, 130 50, 122 70 L 92 175 C 130 178, 175 178, 178 145 C 178 122, 138 118, 118 122 C 168 122, 195 138, 188 165 C 180 188, 130 192, 95 178',
        { x: 70, y: 175 },
        'downstroke',
        'down · upper bowl · lower bowl',
      ),
    ],
  },
  {
    char: 'C',
    case: 'upper',
    height: 'capital',
    cue: 'Loop entry. Open backward C. Out.',
    description: 'A single, open sweep.',
    strokes: [
      stroke(
        'M 195 70 C 165 35, 95 38, 75 90 C 60 138, 110 195, 178 178 C 168 178, 165 165, 175 158',
        { x: 195, y: 70 },
        'overcurve',
        'open backward C',
      ),
    ],
  },
  {
    char: 'L',
    case: 'upper',
    height: 'capital',
    cue: 'Loop entry. Down. Exit along the baseline.',
    description: 'A flowing single sweep.',
    strokes: [
      stroke(
        'M 75 165 C 100 110, 125 55, 150 45 C 162 42, 168 55, 158 70 L 110 165 C 118 180, 150 188, 185 175',
        { x: 75, y: 165 },
        'loop',
        'loop · down · baseline exit',
      ),
    ],
  },
  {
    char: 'M',
    case: 'upper',
    height: 'capital',
    cue: 'Up. Down. Up. Down. Out.',
    description: 'Three strokes, evenly spaced.',
    strokes: [
      stroke(
        'M 50 180 C 60 130, 78 75, 92 55 C 102 50, 105 65, 100 82 L 85 180 C 95 130, 108 80, 122 65 C 132 60, 132 78, 128 92 L 115 180 C 125 130, 138 80, 152 60 C 162 55, 168 70, 162 92 L 162 180',
        { x: 50, y: 180 },
        'upstroke',
        'three peaks',
      ),
    ],
  },
  {
    char: 'O',
    case: 'upper',
    height: 'capital',
    cue: 'Counterclockwise oval. Close at the top.',
    description: 'A closed, leaning oval.',
    strokes: [
      stroke(
        'M 168 50 C 120 35, 65 80, 75 130 C 88 185, 165 200, 195 158 C 215 122, 205 60, 168 50',
        { x: 168, y: 50 },
        'oval',
        'leaning oval',
      ),
    ],
  },
  {
    char: 'P',
    case: 'upper',
    height: 'capital',
    cue: 'Down. Up. Bowl. Out.',
    description: 'A capital with a half-bowl.',
    strokes: [
      stroke(
        'M 70 180 C 80 130, 95 70, 115 45 C 128 40, 132 55, 125 75 L 95 180 C 130 95, 178 110, 175 145 C 170 175, 130 178, 105 162',
        { x: 70, y: 180 },
        'downstroke',
        'down · upstroke · bowl',
      ),
    ],
  },
  {
    char: 'S',
    case: 'upper',
    height: 'capital',
    cue: 'Loop entry. Forward S-curve. Close at baseline.',
    description: 'A single fluid S.',
    strokes: [
      stroke(
        'M 195 70 C 178 38, 122 32, 95 60 C 70 92, 115 115, 145 122 C 188 132, 205 165, 178 188 C 145 205, 95 195, 75 168',
        { x: 195, y: 70 },
        'loop',
        'loop · S · close',
      ),
    ],
  },
  {
    char: 'T',
    case: 'upper',
    height: 'capital',
    cue: 'Loop top. Down. Lift. Crossbar.',
    description: 'A flagged stem.',
    strokes: [
      stroke(
        'M 60 60 C 95 40, 165 45, 195 65 M 130 55 L 105 175 C 110 188, 138 192, 165 178',
        { x: 60, y: 60 },
        'cross',
        'crossbar · stem',
      ),
    ],
  },
];

export const ALL_LETTERS: CursiveLetter[] = [...LOWERCASE, ...UPPERCASE];
export const LOWERCASE_LETTERS = LOWERCASE;
export const UPPERCASE_LETTERS = UPPERCASE;

export const getLetter = (char: string): CursiveLetter | undefined =>
  ALL_LETTERS.find((l) => l.char === char);

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
