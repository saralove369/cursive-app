# Cursive — Product Requirements Document

## Vision
A premium cognitive wellness and analog creativity platform for adults reclaiming focus, memory, creativity, and analog presence through cursive handwriting. **Not** a children's handwriting app. The aesthetic is dark academia, vintage library, fountain pen culture, Moleskine journals — a sanctuary for thoughtful people in an overstimulated digital world.

## Aesthetic Pillars
- Warm ivory paper (#F5F1E8) · charcoal ink (#2C2C2C) · muted gold (#C9A961)
- Elegant serif typography (Playfair Display, EB Garamond, Crimson Text)
- Realistic ink animations · paper textures · cinematic transitions
- Generous whitespace · low-stimulation · intentionally slow
- No gamification · no social-media patterns · no bright colors

## MVP Features (v1.0)

### 1. Onboarding (3 cinematic screens)
- Frames the app as "a sanctuary for deep thought"
- Full-bleed imagery of fountain pens, cursive script, dark academia libraries
- Skip option · slow fade transitions · subtle haptics

### 2. Handwriting Studio (Primary Tab)
- Lowercase / uppercase letter selector (52 cursive letters with SVG path guides)
- Word practice (love, hope, silence, memory, gratitude, breathe, still, become)
- Free Page (open Skia canvas)
- Premium Skia ink rendering with smooth quadratic-bezier interpolation
- Faint gold ghost-stroke guide overlays · baseline rule lines
- Soft micro-haptics on stroke start

### 3. Themed Collections (27 curated pieces)
- Categories: Philosophy · Poetry · Letters · Affirmations · Mindfulness · Recipes · Creativity · Gratitude
- Authors: Marcus Aurelius, Neville Goddard, Seneca, Emerson, Rumi, Dickinson, Mary Oliver, Sullivan Ballou, Robert Louis Stevenson, anonymous Victorian/Belle Époque correspondents
- Each piece: title, author, era, contextual intro, body, word count, estimated minutes
- Read → Write → Complete flow with calm sepia "It is done" celebration

### 4. Historical Cursive Archive (5 documents)
- 1872 country diary · 1850 cordial recipe · 1889 Paris letter · 1894 naturalist notebook · 1910 mother's letter
- Facsimile-style display with old paper texture
- Transcribe-by-hand mode

### 5. Progress Tracking
- Sessions / Minutes / Words counters
- Current & longest streak (consecutive days)
- Sessions by category breakdown
- Recent sessions list
- Calm, non-competitive presentation (no progress bars, no notifications)

### 6. Profile + Analog Club Shell
- Guest mode by default · optional name field
- Penpal Waitlist (email + interests + note)
- "Saved Pieces — coming soon" placeholder
- About card · subtle version line

## Architecture

### Frontend (Expo Router · React Native)
- `app/_layout.tsx` — root, font loading (Playfair / EB Garamond / Crimson)
- `app/index.tsx` — splash redirect (onboarded? → tabs : onboarding)
- `app/onboarding.tsx` — 3-screen horizontal pager with cinematic imagery
- `app/(tabs)/{studio,collections,archive,progress,profile}.tsx`
- `app/practice/[letter].tsx` — Skia practice canvas (letter, word, freewrite)
- `app/session/[id].tsx` — read/write/complete flow for content pieces
- `app/archive/[id].tsx` — historical document transcription
- `app/penpal.tsx` — Analog Club waitlist form
- `src/components/{HandwritingCanvas,PaperBackground,InkButton,ScreenHeader}`
- `src/data/cursive-letters.ts` — 52 hand-crafted cursive SVG paths
- `src/lib/{api,storage,haptics}.ts`
- `src/theme.ts` — design tokens

### Backend (FastAPI · MongoDB)
- `GET /api/content` — list curated pieces (filterable by category)
- `GET /api/content/categories` — category counts
- `GET /api/content/{id}`
- `GET /api/archive` · `GET /api/archive/{id}`
- `POST /api/sessions` · `GET /api/sessions/{user_id}`
- `GET /api/progress/{user_id}` — streak + stats
- `POST/GET /api/profiles` (guest-friendly)
- `POST/DELETE/GET /api/favorites`
- `POST /api/penpal/signup`

### Storage
- MongoDB collections: `content_library`, `historical_documents`, `writing_sessions`, `profiles`, `favorites`, `penpal_waitlist`
- Seeded idempotently on startup (27 pieces, 5 docs)
- Local: AsyncStorage for `user_id`, `display_name`, `onboarded`

## Authentication
- **Guest-first**: anonymous UUID generated on first launch, stored locally
- Optional name in Profile tab (saved to backend profile)
- No login required for any feature in v1.0

## Out of Scope (v1)
- Apple/Google social login (deferred)
- Full penpal matching system (waitlist only)
- AI writing prompts (curated content only)
- Saved favorites UI (placeholder)
- Apple Pencil pressure sensitivity (basic touch supported; pressure can be added in v2)

## Future Enhancements
- AI-powered adaptive prompts (OpenAI integration scaffolded)
- Handwriting evolution gallery (capture canvas snapshots)
- Sound design (gentle ambient + ink-on-paper foley)
- Apple/Google login
- Live penpal matching
- Tablet-optimized writing surface
