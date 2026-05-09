/**
 * Foundational stroke drills — Palmer Method (1888).
 * These are the prerequisite exercises practiced before any letter form,
 * to develop wrist movement, slant rhythm, and consistent pressure.
 */

export interface PenmanshipDrill {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  cue: string;
  /** Repeat-pattern character used for the cursive-font reference overlay. */
  glyph: string;
  /** Number of repeats to render across the practice line. */
  repeats: number;
  /** Which guide structure best frames the drill. */
  guide: 'minimum' | 'ascender' | 'descender';
}

export const PENMANSHIP_DRILLS: PenmanshipDrill[] = [
  {
    id: 'compact-oval',
    name: 'The Compact Oval',
    eyebrow: 'DRILL · I',
    description:
      'The smallest oval. The foundation of every minimum letter — a, c, d, e, g, o, q. Practiced in counterclockwise loops, joined.',
    cue: 'Counterclockwise. Even rhythm. Many ovals, joined.',
    glyph: 'oooooo',
    repeats: 1,
    guide: 'minimum',
  },
  {
    id: 'direct-oval',
    name: 'The Direct Oval',
    eyebrow: 'DRILL · II',
    description:
      'A larger oval drawn from the headline upward. Build the shoulder muscle and the steady wrist of analog writing.',
    cue: 'Larger. Slower. Steady pressure.',
    glyph: 'OOOOO',
    repeats: 1,
    guide: 'ascender',
  },
  {
    id: 'push-pull',
    name: 'Push-Pull',
    eyebrow: 'DRILL · III',
    description:
      'Slanted vertical strokes drilled in pairs. Develops the slant rhythm and downstroke control of all stem letters.',
    cue: 'Pull down with control. Push up with grace.',
    glyph: '||||||||||',
    repeats: 1,
    guide: 'ascender',
  },
  {
    id: 'undercurve',
    name: 'The Undercurve',
    eyebrow: 'DRILL · IV',
    description:
      'The connecting stroke that begins almost every cursive letter. A small upward curve from baseline to headline.',
    cue: 'Up — and lightly down. Up — and lightly down.',
    glyph: 'iiiiiii',
    repeats: 1,
    guide: 'minimum',
  },
  {
    id: 'overcurve',
    name: 'The Overcurve',
    eyebrow: 'DRILL · V',
    description:
      'The arching stroke that begins m, n, x, and joins after o, b, v, w. A descending curve from headline to baseline.',
    cue: 'Roll the curve. Let the wrist breathe.',
    glyph: 'nnnnnn',
    repeats: 1,
    guide: 'minimum',
  },
  {
    id: 'compact-loop',
    name: 'Loops',
    eyebrow: 'DRILL · VI',
    description:
      'The ascending loop — foundation of b, f, h, k, l. Tall, slender, and slanted with the body of the letter.',
    cue: 'Tall. Slender. The same slant as the body.',
    glyph: 'llllll',
    repeats: 1,
    guide: 'ascender',
  },
  {
    id: 'descending-loop',
    name: 'Descending Loops',
    eyebrow: 'DRILL · VII',
    description:
      'The lower loop — foundation of g, j, y, z. Cross at the baseline; never below the descender line.',
    cue: 'Cross at the baseline. Even spacing.',
    glyph: 'gggggg',
    repeats: 1,
    guide: 'descender',
  },
  {
    id: 'connector-rhythm',
    name: 'Connector Rhythm',
    eyebrow: 'DRILL · VIII',
    description:
      'Continuous joined undercurves — the tactile vocabulary of fluid handwriting. Practiced until the rhythm becomes the breath.',
    cue: 'A single, continuous breath across the page.',
    glyph: 'unununu',
    repeats: 1,
    guide: 'minimum',
  },
];

export const getDrill = (id: string): PenmanshipDrill | undefined =>
  PENMANSHIP_DRILLS.find((d) => d.id === id);
