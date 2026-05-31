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

// --- UPPERCASE — Palmer Method Capitals (1888) -------------------------------
//
// Construction system (consistent across all 26 letters):
//   Cap top:    y = 50
//   Cap mid:    y = 120
//   Baseline:   y = 190
//   Below base: y = 220 (descender for J, Y, Z)
//   Left edge:  x ≈ 55-65
//   Right edge: x ≈ 200-225
//
// All forms use smooth cubic-Bézier curves (no straight L segments mid-stroke)
// so they feel hand-drawn, not typographic. Slant is applied at render time.
//
const UPPERCASE: CursiveLetter[] = [
  // A — Spencerian/Palmer A: lower-left curved entry, peak, descending right
  // arm, then crossbar (separate stroke).
  {
    char: 'A',
    case: 'upper',
    height: 'capital',
    cue: 'Curved up to peak. Down to baseline. Lift. Crossbar.',
    description: 'A peak between two flowing strokes; crossbar last.',
    strokes: [
      stroke(
        'M 65 188 C 78 145, 100 95, 130 55 C 145 45, 152 50, 152 70 C 152 100, 162 150, 178 188 C 192 196, 210 188, 222 178',
        { x: 65, y: 188 },
        'upstroke',
        'curved up · peak · down · out',
      ),
      stroke(
        'M 95 145 C 120 138, 150 138, 170 145',
        { x: 95, y: 145 },
        'cross',
        'crossbar at midline',
      ),
    ],
  },

  // B — Capital stem with two stacked bowls. The Palmer B is one continuous
  // stroke; pen does not lift between bowls.
  {
    char: 'B',
    case: 'upper',
    height: 'capital',
    cue: 'Stem. Upper bowl. Lower bowl. Out.',
    description: 'Two bowls stacked, drawn in one breath.',
    strokes: [
      stroke(
        'M 80 188 C 85 140, 100 80, 122 50 C 138 42, 148 55, 138 78 C 122 110, 100 160, 88 188 C 130 192, 178 178, 178 145 C 178 122, 138 122, 110 130 C 158 122, 200 138, 192 168 C 184 192, 130 195, 95 180',
        { x: 80, y: 188 },
        'downstroke',
        'stem · upper bowl · lower bowl',
      ),
    ],
  },

  // C — Open backward C. Single graceful sweep with a small entry hook.
  {
    char: 'C',
    case: 'upper',
    height: 'capital',
    cue: 'Hook entry from above. Backward C. Exit at baseline.',
    description: 'One open sweep, like a sail catching wind.',
    strokes: [
      stroke(
        'M 200 75 C 195 55, 178 45, 158 50 C 115 55, 75 95, 78 138 C 82 180, 138 200, 188 180 C 200 175, 205 168, 200 162',
        { x: 200, y: 75 },
        'overcurve',
        'hook · open C · check',
      ),
    ],
  },

  // D — Capital stem on left, large oval body to baseline. One stroke.
  {
    char: 'D',
    case: 'upper',
    height: 'capital',
    cue: 'Stem. Bow out. Sweep around. Close to stem.',
    description: 'A leaning oval on a single straight stem.',
    strokes: [
      stroke(
        'M 75 188 C 80 145, 92 90, 110 55 C 122 45, 132 52, 128 72 C 118 100, 100 150, 90 188 C 140 195, 200 178, 205 122 C 208 75, 165 55, 118 70',
        { x: 75, y: 188 },
        'downstroke',
        'stem · large oval · close',
      ),
    ],
  },

  // E — Two backward curves, one above the other, joined at the middle.
  {
    char: 'E',
    case: 'upper',
    height: 'capital',
    cue: 'Upper backward curve. Centre tuck. Lower backward curve.',
    description: 'A figure of two soft loops, the centre held still.',
    strokes: [
      stroke(
        'M 195 65 C 178 45, 138 42, 110 60 C 85 80, 95 110, 130 115 C 105 118, 88 132, 92 158 C 98 182, 158 192, 195 172',
        { x: 195, y: 65 },
        'overcurve',
        'upper backward · waist · lower backward',
      ),
    ],
  },

  // F — Top flag and stem (one stroke); horizontal crossbar (second stroke).
  {
    char: 'F',
    case: 'upper',
    height: 'capital',
    cue: 'Top flag from right to left. Down. Lift. Crossbar.',
    description: 'A flagged stem with a small bar at the heart.',
    strokes: [
      stroke(
        'M 200 65 C 175 50, 145 48, 130 55 C 122 60, 122 72, 130 80 C 122 105, 110 150, 100 188 C 92 200, 75 195, 72 180',
        { x: 200, y: 65 },
        'overcurve',
        'top flag · stem',
      ),
      stroke(
        'M 90 125 C 110 120, 145 120, 165 125',
        { x: 90, y: 125 },
        'cross',
        'crossbar at midline',
      ),
    ],
  },

  // G — A C with a small re-entry stroke from baseline back into the bowl.
  {
    char: 'G',
    case: 'upper',
    height: 'capital',
    cue: 'Backward C. Re-enter at baseline. Small inner stroke.',
    description: 'A C that turns inward — the signature Palmer G.',
    strokes: [
      stroke(
        'M 200 75 C 195 55, 178 45, 158 50 C 115 55, 75 95, 78 138 C 82 180, 138 198, 178 178 C 175 158, 172 138, 168 122 C 152 130, 138 132, 122 130',
        { x: 200, y: 75 },
        'overcurve',
        'open C · inner stroke',
      ),
    ],
  },

  // H — Two parallel capital stems joined by a horizontal crossbar.
  {
    char: 'H',
    case: 'upper',
    height: 'capital',
    cue: 'Left stem with top loop. Lift. Right stem with top loop. Lift. Crossbar.',
    description: 'Two stems and a single bar between them.',
    strokes: [
      stroke(
        'M 60 95 C 68 65, 88 45, 105 52 C 118 60, 110 78, 95 80 C 88 110, 78 158, 70 188 C 75 198, 92 200, 105 188',
        { x: 60, y: 95 },
        'loop',
        'left top loop · stem',
      ),
      stroke(
        'M 165 60 C 178 55, 188 65, 178 78 C 168 105, 155 158, 148 188 C 152 198, 170 200, 185 188',
        { x: 165, y: 60 },
        'downstroke',
        'right stem',
      ),
      stroke(
        'M 88 122 C 115 118, 150 118, 170 122',
        { x: 88, y: 122 },
        'cross',
        'crossbar between stems',
      ),
    ],
  },

  // I — Top loop, descending stem, base loop. One continuous stroke.
  {
    char: 'I',
    case: 'upper',
    height: 'capital',
    cue: 'Top loop. Down. Base loop. Exit.',
    description: 'A spine between two small terminal loops.',
    strokes: [
      stroke(
        'M 80 75 C 90 50, 115 42, 130 55 C 138 65, 130 78, 115 78 C 108 110, 95 158, 88 188 C 82 205, 60 208, 55 192 C 52 178, 75 175, 92 188 C 115 195, 150 192, 175 180',
        { x: 80, y: 75 },
        'loop',
        'top loop · stem · base loop',
      ),
    ],
  },

  // J — Like I, but the stem extends below the baseline into a descending loop.
  {
    char: 'J',
    case: 'upper',
    height: 'capital',
    cue: 'Top loop. Down past the baseline. Descender loop.',
    description: 'A taller I that dives below the line.',
    strokes: [
      stroke(
        'M 130 75 C 140 50, 165 42, 178 55 C 185 65, 178 78, 162 78 C 158 110, 148 160, 138 195 C 130 218, 90 222, 75 205 C 65 192, 88 185, 105 198',
        { x: 130, y: 75 },
        'loop',
        'top loop · stem · descender loop',
      ),
    ],
  },

  // K — Left stem (with top loop), then a separate compound stroke for the
  // arm-knot-leg.
  {
    char: 'K',
    case: 'upper',
    height: 'capital',
    cue: 'Stem with top loop. Lift. Curve in. Knot. Leg out.',
    description: 'A capital with a small heart-knot at its centre.',
    strokes: [
      stroke(
        'M 60 95 C 68 65, 88 45, 105 52 C 118 60, 110 78, 95 80 C 88 110, 78 158, 70 188 C 75 198, 92 200, 108 188',
        { x: 60, y: 95 },
        'loop',
        'left top loop · stem',
      ),
      stroke(
        'M 195 55 C 175 80, 148 110, 115 122 C 138 130, 168 145, 152 168 C 145 180, 168 192, 192 182',
        { x: 195, y: 55 },
        'overcurve',
        'arm · knot · leg',
      ),
    ],
  },

  // L — A graceful leaning loop, then exit along the baseline.
  {
    char: 'L',
    case: 'upper',
    height: 'capital',
    cue: 'Loop in from below. Up. Down to baseline. Out.',
    description: 'A flowing single sweep, the most graceful of capitals.',
    strokes: [
      stroke(
        'M 75 175 C 90 130, 110 80, 138 50 C 152 42, 162 50, 158 70 C 145 95, 118 145, 100 178 C 110 192, 145 195, 178 180',
        { x: 75, y: 175 },
        'loop',
        'loop · stem · baseline exit',
      ),
    ],
  },

  // M — Three peaks of equal height. One continuous stroke.
  {
    char: 'M',
    case: 'upper',
    height: 'capital',
    cue: 'Up to first peak. Down. Up to second. Down. Up to third. Down. Out.',
    description: 'Three peaks evenly spaced; the rhythm is the lesson.',
    strokes: [
      stroke(
        'M 50 188 C 58 138, 75 75, 90 55 C 100 50, 105 60, 100 78 C 95 110, 88 155, 85 188 C 92 138, 108 80, 122 60 C 132 55, 138 65, 132 82 C 125 115, 118 158, 115 188 C 122 138, 138 80, 152 58 C 162 52, 170 62, 165 80 C 158 115, 152 158, 150 188 C 165 198, 188 195, 200 180',
        { x: 50, y: 188 },
        'upstroke',
        'three peaks · out',
      ),
    ],
  },

  // N — Two peaks. Same construction as M, less one peak.
  {
    char: 'N',
    case: 'upper',
    height: 'capital',
    cue: 'Up to first peak. Down. Up to second. Down. Out.',
    description: 'The same rhythm as M, less one peak.',
    strokes: [
      stroke(
        'M 60 188 C 68 138, 88 75, 105 55 C 115 50, 122 60, 115 78 C 108 110, 100 158, 95 188 C 105 138, 122 80, 138 58 C 150 52, 158 62, 152 80 C 145 115, 138 158, 135 188 C 148 198, 172 195, 188 180',
        { x: 60, y: 188 },
        'upstroke',
        'two peaks · out',
      ),
    ],
  },

  // O — A leaning oval, closed at the top.
  {
    char: 'O',
    case: 'upper',
    height: 'capital',
    cue: 'Up and over. Counterclockwise oval. Close at the top.',
    description: 'A closed oval, leaning forward like a held breath.',
    strokes: [
      stroke(
        'M 175 55 C 130 38, 78 70, 70 122 C 65 175, 130 200, 178 178 C 218 158, 220 85, 192 60 C 182 52, 168 52, 158 60',
        { x: 175, y: 55 },
        'oval',
        'leaning oval · close at top',
      ),
    ],
  },

  // P — Capital stem with an upper bowl that closes back to the stem.
  {
    char: 'P',
    case: 'upper',
    height: 'capital',
    cue: 'Stem. Upper bowl. Close to the stem.',
    description: 'A stem with one closed bowl above the midline.',
    strokes: [
      stroke(
        'M 75 188 C 80 145, 95 90, 115 55 C 128 45, 138 52, 130 75 C 118 105, 102 152, 92 188 C 138 110, 195 110, 188 148 C 180 178, 130 178, 108 162',
        { x: 75, y: 188 },
        'downstroke',
        'stem · bowl · close',
      ),
    ],
  },

  // Q — A leaning oval (like O) with a final crossing flourish below.
  {
    char: 'Q',
    case: 'upper',
    height: 'capital',
    cue: 'Counterclockwise oval. Lift. Diagonal flourish across baseline.',
    description: 'An O with a small dash — the Palmer Q.',
    strokes: [
      stroke(
        'M 175 55 C 130 38, 78 70, 70 122 C 65 175, 130 200, 178 178 C 218 158, 220 85, 192 60 C 182 52, 168 52, 158 60',
        { x: 175, y: 55 },
        'oval',
        'leaning oval',
      ),
      stroke(
        'M 130 158 C 158 170, 188 185, 205 200',
        { x: 130, y: 158 },
        'cross',
        'crossing flourish',
      ),
    ],
  },

  // R — Like P, with an additional descending leg from the bowl.
  {
    char: 'R',
    case: 'upper',
    height: 'capital',
    cue: 'Stem. Upper bowl. Close. Leg out at baseline.',
    description: 'P with a leg.',
    strokes: [
      stroke(
        'M 75 188 C 80 145, 95 90, 115 55 C 128 45, 138 52, 130 75 C 118 105, 102 152, 92 188 C 138 110, 195 110, 188 148 C 180 168, 130 168, 110 152 C 132 162, 158 178, 178 195',
        { x: 75, y: 188 },
        'downstroke',
        'stem · bowl · leg',
      ),
    ],
  },

  // S — A forward S-curve. Single fluid stroke.
  {
    char: 'S',
    case: 'upper',
    height: 'capital',
    cue: 'Hook entry from above. Forward curve. Loop close at baseline.',
    description: 'A single fluid S.',
    strokes: [
      stroke(
        'M 195 65 C 178 38, 122 32, 92 60 C 65 92, 110 118, 142 125 C 188 138, 205 168, 175 188 C 142 200, 92 188, 75 162',
        { x: 195, y: 65 },
        'loop',
        'hook · forward S · close',
      ),
    ],
  },

  // T — A flagged top stroke, then descending stem.
  {
    char: 'T',
    case: 'upper',
    height: 'capital',
    cue: 'Top flag from right to left. Down. Out.',
    description: 'A flagged stem.',
    strokes: [
      stroke(
        'M 205 65 C 178 48, 145 45, 128 55 C 118 62, 118 75, 128 82 C 120 110, 108 158, 100 188 C 105 200, 130 200, 158 188',
        { x: 205, y: 65 },
        'overcurve',
        'top flag · stem · out',
      ),
    ],
  },

  // U — Two arches joined: like a wide cursive 'u' grown tall.
  {
    char: 'U',
    case: 'upper',
    height: 'capital',
    cue: 'Up to first peak. Down. Curve through baseline. Up. Down. Out.',
    description: 'Two parallel descending arches, joined by a curve at the base.',
    strokes: [
      stroke(
        'M 55 60 C 60 105, 70 165, 95 178 C 122 182, 138 145, 138 100 C 138 78, 142 60, 155 52 C 168 48, 175 60, 168 80 C 162 110, 152 158, 148 188 C 158 198, 178 195, 195 180',
        { x: 55, y: 60 },
        'upstroke',
        'two arches',
      ),
    ],
  },

  // V — A wide V; right arm exits with a small check at midline.
  {
    char: 'V',
    case: 'upper',
    height: 'capital',
    cue: 'Down to baseline. Up. Check exit at midline.',
    description: 'A V with a graceful exit.',
    strokes: [
      stroke(
        'M 55 55 C 70 100, 95 150, 118 178 C 132 168, 158 105, 175 55 C 178 80, 195 78, 215 70',
        { x: 55, y: 55 },
        'downstroke',
        'V · check exit',
      ),
    ],
  },

  // W — Two V's joined; finishes with the same midline check as V.
  {
    char: 'W',
    case: 'upper',
    height: 'capital',
    cue: 'Down. Up. Down. Up. Check exit.',
    description: 'Three valleys, one breath.',
    strokes: [
      stroke(
        'M 35 55 C 50 100, 70 145, 85 178 C 95 168, 105 115, 110 65 C 118 105, 130 150, 142 178 C 152 168, 165 115, 175 60 C 180 80, 200 78, 220 70',
        { x: 35, y: 55 },
        'downstroke',
        'three valleys · check',
      ),
    ],
  },

  // X — Two crossing diagonals, drawn as separate strokes.
  {
    char: 'X',
    case: 'upper',
    height: 'capital',
    cue: 'Diagonal down. Lift. Crossing diagonal.',
    description: 'Two strokes meeting at the centre.',
    strokes: [
      stroke(
        'M 65 55 C 92 95, 122 138, 152 188',
        { x: 65, y: 55 },
        'downstroke',
        'first diagonal',
      ),
      stroke(
        'M 175 55 C 145 95, 110 138, 78 188',
        { x: 175, y: 55 },
        'downstroke',
        'crossing diagonal',
      ),
    ],
  },

  // Y — A V whose right arm continues below the baseline into a loop.
  {
    char: 'Y',
    case: 'upper',
    height: 'capital',
    cue: 'Down to centre. Lift. Down through centre, past baseline, loop.',
    description: 'A V with a descending loop.',
    strokes: [
      stroke(
        'M 60 55 C 80 95, 100 130, 115 150',
        { x: 60, y: 55 },
        'downstroke',
        'left arm to centre',
      ),
      stroke(
        'M 175 55 C 158 90, 138 130, 122 175 C 115 215, 75 222, 60 205 C 50 192, 75 188, 95 200',
        { x: 175, y: 55 },
        'descender',
        'right arm · descender loop',
      ),
    ],
  },

  // Z — Compound zig at the top, a downstroke through baseline, descender loop.
  {
    char: 'Z',
    case: 'upper',
    height: 'capital',
    cue: 'Compound entry. Zig at midline. Down. Descender loop.',
    description: 'A zigzag with a descending loop.',
    strokes: [
      stroke(
        'M 65 75 C 95 50, 138 50, 158 65 C 122 92, 88 122, 72 145 C 100 132, 138 132, 162 148 C 158 178, 152 200, 142 215 C 130 225, 88 225, 75 210 C 65 198, 90 192, 115 200 C 142 205, 175 195, 195 180',
        { x: 65, y: 75 },
        'overcurve',
        'zig · descender · loop',
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
