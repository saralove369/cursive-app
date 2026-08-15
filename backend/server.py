"""
Cursive Backend - A cognitive wellness and analog creativity platform.
Premium handwriting and mindful writing rituals.
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Cursive API", description="A sanctuary for deep thought.")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class ContentPiece(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # philosophy | poetry | letters | affirmations | mindfulness | recipes | creativity | gratitude
    title: str
    body: str
    author: Optional[str] = None
    era: Optional[str] = None
    intro: Optional[str] = None  # contextual blurb
    tags: List[str] = Field(default_factory=list)
    word_count: int = 0
    estimated_minutes: int = 3


class HistoricalDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    transcription: str = ""  # empty when transcription_status == 'study'
    transcription_status: str = "verified"  # 'verified' | 'study' (user deciphers)
    context: str
    era: str
    source: Optional[str] = None
    image_description: str  # description of what historical doc looks like
    image_url: Optional[str] = None  # facsimile image (remote fallback)
    asset_key: Optional[str] = None  # optional key for a locally-bundled image (see /frontend/src/lib/manuscript-assets.ts)
    asset_key_secondary: Optional[str] = None  # second page for multi-page manuscripts
    archival_note: Optional[str] = None  # short note for the manuscript room
    archival_credit: Optional[str] = None  # full attribution + license line
    location: Optional[str] = None  # where it was written / kept


class WritingSessionCreate(BaseModel):
    user_id: str
    content_id: Optional[str] = None
    content_type: str  # 'letter' | 'collection' | 'archive' | 'freewrite'
    duration_seconds: int
    word_count: int = 0
    title: Optional[str] = None


class WritingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content_id: Optional[str] = None
    content_type: str
    duration_seconds: int
    word_count: int = 0
    title: Optional[str] = None
    completed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProfileCreate(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    email: Optional[str] = None


class Profile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class FavoriteCreate(BaseModel):
    user_id: str
    content_id: str
    content_type: str = "collection"


class Favorite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    content_id: str
    content_type: str = "collection"
    saved_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PenpalSignup(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    note: Optional[str] = None


class PenpalEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    display_name: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    note: Optional[str] = None
    joined_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProgressStats(BaseModel):
    total_sessions: int
    total_minutes: int
    total_words: int
    current_streak: int
    longest_streak: int
    sessions_by_category: Dict[str, int]
    last_session_at: Optional[str] = None


# ---------- Curated Content Library ----------
CURATED_CONTENT: List[Dict[str, Any]] = [
    # Philosophy
    {
        "category": "philosophy",
        "title": "On the Brevity of Being",
        "body": "You have power over your mind, not outside events. Realize this, and you will find strength.",
        "author": "Marcus Aurelius",
        "era": "180 AD",
        "intro": "From Meditations, written in the silence between battles.",
        "tags": ["stoicism", "focus", "ancient"],
    },
    {
        "category": "philosophy",
        "title": "The Art of Not Reacting",
        "body": "Waste no more time arguing what a good man should be. Be one.",
        "author": "Marcus Aurelius",
        "era": "180 AD",
        "intro": "A directive across nineteen centuries.",
        "tags": ["stoicism", "presence"],
    },
    {
        "category": "philosophy",
        "title": "The Imagination as the Workshop",
        "body": "Imagination is the only redemptive power in the universe. Assume the feeling of the wish fulfilled.",
        "author": "Neville Goddard",
        "era": "1944",
        "intro": "On the rewiring of inner attention.",
        "tags": ["consciousness", "intention"],
    },
    {
        "category": "philosophy",
        "title": "On Time and Worth",
        "body": "Begin at once to live, and count each separate day as a separate life.",
        "author": "Seneca",
        "era": "65 AD",
        "intro": "From Letters from a Stoic.",
        "tags": ["stoicism", "presence", "time"],
    },
    {
        "category": "philosophy",
        "title": "Self-Reliance",
        "body": "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
        "author": "Ralph Waldo Emerson",
        "era": "1841",
        "intro": "A quiet declaration from the New England transcendentalists.",
        "tags": ["self", "transcendence"],
    },
    # Poetry
    {
        "category": "poetry",
        "title": "The Guest House",
        "body": "This being human is a guest house. Every morning a new arrival. Welcome and entertain them all.",
        "author": "Rumi",
        "era": "13th century",
        "intro": "Translated by Coleman Barks.",
        "tags": ["mysticism", "acceptance"],
    },
    {
        "category": "poetry",
        "title": "Hope",
        "body": "Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.",
        "author": "Emily Dickinson",
        "era": "1861",
        "intro": "A small, defiant lyric.",
        "tags": ["hope", "introspection"],
    },
    {
        "category": "poetry",
        "title": "Wild Geese",
        "body": "You do not have to be good. You do not have to walk on your knees for a hundred miles through the desert, repenting.",
        "author": "Mary Oliver",
        "era": "1986",
        "intro": "A permission, written in plain American light.",
        "tags": ["self-compassion", "nature"],
    },
    {
        "category": "poetry",
        "title": "On Silence",
        "body": "Silence is sometimes the best answer. Listen to silence. It has so much to say.",
        "author": "Rumi",
        "era": "13th century",
        "intro": "From the Masnavi.",
        "tags": ["mysticism", "stillness"],
    },
    {
        "category": "poetry",
        "title": "Tell All The Truth",
        "body": "Tell all the truth but tell it slant — Success in Circuit lies. The Truth must dazzle gradually, or every man be blind.",
        "author": "Emily Dickinson",
        "era": "1872",
        "intro": "On the gentleness of revelation.",
        "tags": ["truth", "introspection"],
    },
    # Historical Letters
    {
        "category": "letters",
        "title": "Letter from a Soldier, 1864",
        "body": "My dear Sarah, the indications are very strong that we shall move in a few days. If I do not return, my love for you is deathless.",
        "author": "Sullivan Ballou",
        "era": "1861",
        "intro": "Written one week before Bull Run. He did not return.",
        "tags": ["letters", "victorian", "love"],
    },
    {
        "category": "letters",
        "title": "Notes from the Garden",
        "body": "I have walked the garden each morning at the hour you used to. The roses are returned. I think of you always.",
        "author": "Anonymous",
        "era": "1892",
        "intro": "From a Victorian correspondence collection.",
        "tags": ["letters", "victorian", "longing"],
    },
    {
        "category": "letters",
        "title": "To a Distant Friend",
        "body": "We are all of us travellers in the wilderness of this world, and the best we can find in our travels is an honest friend.",
        "author": "Robert Louis Stevenson",
        "era": "1888",
        "intro": "From a letter on friendship.",
        "tags": ["letters", "friendship"],
    },
    {
        "category": "letters",
        "title": "A Sister's Counsel",
        "body": "Do not lose heart. The seasons will turn; they always do. Tend to small things. Sleep well. Write me when the wind allows.",
        "author": "Anonymous",
        "era": "1870",
        "intro": "A handwritten letter from rural England.",
        "tags": ["letters", "comfort"],
    },
    # Affirmations
    {
        "category": "affirmations",
        "title": "I Return to Myself",
        "body": "I return to myself slowly. My breath is unhurried. My attention is mine. I am here, and that is enough.",
        "author": None,
        "era": None,
        "intro": "A daily anchor.",
        "tags": ["calm", "presence"],
    },
    {
        "category": "affirmations",
        "title": "On Becoming",
        "body": "I am the slow becoming of my deeper attention. I am not the noise; I am the listener beneath it.",
        "author": None,
        "era": None,
        "intro": "Written for the rebuilding of focus.",
        "tags": ["focus", "identity"],
    },
    {
        "category": "affirmations",
        "title": "Creative Confidence",
        "body": "I trust the quiet voice inside me. I make space for unhurried thought. The work will arrive when I am still.",
        "author": None,
        "era": None,
        "intro": "For the artist returning.",
        "tags": ["creativity", "trust"],
    },
    {
        "category": "affirmations",
        "title": "Permission to Slow",
        "body": "I have permission to be slow. To think before I speak. To linger over what is beautiful. There is no race.",
        "author": None,
        "era": None,
        "intro": "An invitation to softness.",
        "tags": ["slow", "permission"],
    },
    # Mindfulness Prompts
    {
        "category": "mindfulness",
        "title": "Three Things",
        "body": "Today I noticed: the precise color of morning light, a sound I had not heard before, and the small kindness of a stranger.",
        "author": None,
        "era": None,
        "intro": "A sensory inventory.",
        "tags": ["mindfulness", "noticing"],
    },
    {
        "category": "mindfulness",
        "title": "What I Carry",
        "body": "What am I carrying that no longer serves me? What can I lay down today, even briefly, to walk a little lighter?",
        "author": None,
        "era": None,
        "intro": "A reflective prompt.",
        "tags": ["mindfulness", "release"],
    },
    {
        "category": "mindfulness",
        "title": "The Hour Before",
        "body": "Describe the hour before you fell asleep last night. The texture of the sheets. The temperature of the room. The thought that lingered.",
        "author": None,
        "era": None,
        "intro": "A memory prompt for slow recall.",
        "tags": ["mindfulness", "memory"],
    },
    # Gratitude
    {
        "category": "gratitude",
        "title": "Three Quiet Gifts",
        "body": "I am grateful for the unseen labor of others, for the chair that holds me, and for the day that asked nothing of me but to begin.",
        "author": None,
        "era": None,
        "intro": "A grounding exercise.",
        "tags": ["gratitude", "stillness"],
    },
    {
        "category": "gratitude",
        "title": "The Smallest Beauty",
        "body": "Today I was grateful for a small beauty I almost missed. I name it here so that I do not miss the next.",
        "author": None,
        "era": None,
        "intro": "Practice noticing.",
        "tags": ["gratitude", "noticing"],
    },
    # Creativity Prompts
    {
        "category": "creativity",
        "title": "An Object Remembers",
        "body": "Choose an object near you. Now write three sentences as though the object were remembering its own life.",
        "author": None,
        "era": None,
        "intro": "An imaginative prompt.",
        "tags": ["creativity", "imagination"],
    },
    {
        "category": "creativity",
        "title": "A Letter from Future Self",
        "body": "Write a brief letter from a version of yourself ten years from now, who is calm, kind, and unhurried. What does she say first?",
        "author": None,
        "era": None,
        "intro": "A future-self exercise.",
        "tags": ["creativity", "self"],
    },
    # Recipes
    {
        "category": "recipes",
        "title": "Grandmother's Honey Cake",
        "body": "Take six eggs, one cup of warm honey, half a cup of strong black tea. Beat the eggs until pale. Fold gently. Bake slowly until golden.",
        "author": "Family Manuscript",
        "era": "circa 1920",
        "intro": "Transcribed from a handwritten book of household receipts.",
        "tags": ["recipes", "heirloom"],
    },
    {
        "category": "recipes",
        "title": "Apricot Preserves",
        "body": "Halve and stone two pounds of ripe apricots. Cover with sugar. Let stand overnight. In the morning, simmer slowly, skimming gently, until thick.",
        "author": "Country Kitchen Receipts",
        "era": "circa 1880",
        "intro": "An old summer ritual.",
        "tags": ["recipes", "vintage"],
    },
]

CURATED_DOCUMENTS: List[Dict[str, Any]] = [
    # ---- 01 · JANE AUSTEN --------------------------------------------------
    {
        "title": "Letter to Cassandra",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Jane Austen wrote frequently to her elder sister Cassandra, her closest "
            "confidante and one of the few people who knew the private Jane behind "
            "the published novels. This letter was written from Bath in May 1801 "
            "and belongs to the small group of surviving letters between the "
            "sisters. Cassandra destroyed many of Jane's letters after her death, "
            "leaving the surviving correspondence as a rare glimpse into Austen's "
            "everyday voice and hand."
        ),
        "era": "12 May 1801",
        "source": "Morgan Library & Museum, New York",
        "image_description": (
            "Folded sheet showing the address panel with wax seal on the left leaf "
            "and the letter's opening — 'Paragon Tuesday May 12' — on the right. "
            "Austen's small, forward-leaning Italian hand, brown iron-gall ink, "
            "the paper's centre-fold visible."
        ),
        "asset_key": "jane-austen-cassandra",
        "archival_note": (
            "Austen's hand is the trained Italian hand of a gentlewoman of her "
            "generation — slender, slanted, with very little space between lines. "
            "To save paper, she occasionally 'crossed' her letters, writing a "
            "second page sideways across the first."
        ),
        "archival_credit": (
            "Manuscript: Morgan Library & Museum, New York. "
            "Digitized image: public-domain reproduction."
        ),
        "location": "Bath, England",
    },

    # ---- 02 · EMILY DICKINSON — Wild Nights! -------------------------------
    {
        "title": "Wild Nights — Wild Nights!",
        "transcription_status": "verified",
        # Faithful transcription preserving Dickinson's own dashes, line breaks,
        # capitalization and closing punctuation. Do NOT normalize.
        "transcription": (
            "\"Wild Nights — Wild Nights!\n"
            "Were I with thee\n"
            "Wild Nights should be\n"
            "Our luxury!\n"
            "\n"
            "Futile — the Winds —\n"
            "To a Heart in port —\n"
            "Done with the Compass —\n"
            "Done with the Chart —!\n"
            "\n"
            "Rowing in Eden —\n"
            "Ah, the Sea!\n"
            "Might I but moor —\n"
            "Tonight —\n"
            "In thee."
        ),
        "context": (
            "Emily Dickinson copied Wild Nights — Wild Nights! into one of the "
            "small handmade fascicles in which she preserved her poems. The "
            "manuscript offers something a printed edition cannot: Dickinson's "
            "own spacing, punctuation, dashes, line arrangement, and physical "
            "relationship to the page. This is not simply a poem to read. It is "
            "an opportunity to study the hand of one of America's most "
            "distinctive poets."
        ),
        "era": "circa 1861",
        "source": "Houghton Library, Harvard University",
        "image_description": (
            "Single leaf, three stanzas, Dickinson's characteristic long "
            "dashes and slightly upward-drifting lines."
        ),
        "asset_key": "dickinson-wild-nights",
        "archival_note": (
            "Notice how the dashes are not punctuation but breath — short ones "
            "lean forward, long ones stretch the line. Dickinson punctuated by "
            "handwriting before she punctuated by grammar."
        ),
        "archival_credit": (
            "Manuscript: Houghton Library, Harvard University. "
            "Digitized image: public-domain reproduction. "
            "Original poem/manuscript: Emily Dickinson."
        ),
        "location": "Amherst, Massachusetts",
    },

    # ---- 03 · VINCENT VAN GOGH ---------------------------------------------
    {
        "title": "Letter to Émile Bernard",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "During his time in Arles, Vincent van Gogh wrote extensively to "
            "fellow artist Émile Bernard. His letters were not merely personal "
            "correspondence; they were a place where he worked through ideas "
            "about painting, color, landscape, art, and friendship.\n\n"
            "His handwriting is particularly fascinating to study because the "
            "page carries the same sense of movement and energy that appears in "
            "his drawings and paintings."
        ),
        "era": "19 April 1888",
        "source": "Van Gogh Museum / archival correspondence",
        "image_description": (
            "A tall sheet of aging paper with a dense French cursive above and "
            "below a small pen sketch of an orchard, the words 'Bleu', 'Blanc' "
            "and 'Vert' inked directly into the drawing to note colours."
        ),
        "asset_key": "van-gogh-bernard",
        "archival_note": (
            "Watch how Van Gogh's letterforms speed up and slow down across the "
            "page — the lines bunch where he is excited, open where he is "
            "thinking. He drew while he wrote; his correspondence is a kind of "
            "sketchbook."
        ),
        "archival_credit": (
            "Original correspondence: Vincent van Gogh, letter to Émile Bernard, "
            "19 April 1888, Arles. Public-domain reproduction."
        ),
        "location": "Arles, France",
    },

    # ---- 04 · LOUIS NOISETTE -----------------------------------------------
    {
        "title": "From a Botanist's Hand",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Louis Claude Noisette (1772–1849) was a French botanist and "
            "horticulturalist known for his work with roses and ornamental "
            "plants. His surviving correspondence gives us an intimate glimpse "
            "into the world of nineteenth-century horticulture: plants "
            "exchanged between gardens, seeds and cuttings, cultivation, "
            "seasons, and the practical knowledge passed between gardeners "
            "and botanists.\n\n"
            "This manuscript is especially beautiful as a handwriting study "
            "because the subject matter itself belongs to the slow, "
            "observational world of gardens."
        ),
        "era": "early 19th century (c. 1804–1820)",
        "source": "Wellcome Collection, MS 7351/81",
        "image_description": (
            "Cream paper, short signed acknowledgement of receipt in French, "
            "an expansive flourished 'L. Noisette' signature filling the "
            "lower right of the sheet."
        ),
        "asset_key": "louis-noisette",
        "archival_note": (
            "Botanists' letters are a small genre of their own — the "
            "handwriting tends to be precise (because plant names must be), "
            "but warm (because the writer is, almost without exception, in "
            "love with what they are writing about)."
        ),
        "archival_credit": (
            "Manuscript: Wellcome Collection, MS 7351/81. "
            "Image credit: Wellcome Collection / Wellcome Images. "
            "License: CC BY 4.0."
        ),
        "location": "Paris, France",
    },

    # ---- 05 · THE RECEIPT BOOK ---------------------------------------------
    {
        "title": "From a Receipt Book",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Before 'recipe' became the standardized word we use today, "
            "household instructions were commonly called receipts. This "
            "manuscript collection contains recipes for preserving fruit, "
            "making cordials, wines, syrups, medicines, and household "
            "preparations, written by several different hands.\n\n"
            "The pages preserve the practical knowledge of a household "
            "across generations: what to preserve, what to cook, what to "
            "distill, and what to keep for winter."
        ),
        "era": "circa 1690–1710",
        "source": "Wellcome Collection, MS.4054",
        "image_description": (
            "Open two-page spread of a bound receipt book, 'Wine & Liquors' "
            "at the head, recipes for Damsons Wine, White Mead, Hipocras, "
            "Corints Wine and Braggat in a clear seventeenth-century hand."
        ),
        "asset_key": "receipt-book",
        "archival_note": (
            "Observe the difference in hands across the volume — at least "
            "three women wrote in this book over fifty years. The earliest "
            "hand is the most flourished; the later ones plainer. Domestic "
            "handwriting tends, across generations, toward greater speed and "
            "less ornament."
        ),
        "archival_credit": (
            "Manuscript: Wellcome Collection, MS.4054. "
            "Credit: Wellcome Collection. Rights: Public Domain Mark."
        ),
        "location": "England",
    },

    # ---- 06 · FREDERICK DOUGLASS -------------------------------------------
    {
        "title": "Letter from Frederick Douglass",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Frederick Douglass wrote this letter to J. A. J. Creswell on "
            "Freedman's Savings Bank letterhead in Washington, D.C., in 1874. "
            "The document is a wonderful example of nineteenth-century "
            "business correspondence: printed institutional letterhead "
            "combined with an entirely personal handwritten body and "
            "signature.\n\n"
            "A small handwritten notation on the reverse reads "
            "'Fredk. Douglass / July 3rd 74.' The page therefore preserves "
            "not only Douglass's words, but his actual hand."
        ),
        "era": "3 July 1874",
        "source": (
            "National Museum of African American History and Culture, "
            "Smithsonian Institution (Object 2021.58.2)"
        ),
        "image_description": (
            "Cream lined stationery under an elaborate engraved letterhead "
            "reading 'Principal Office of the Freedman's Savings and Trust "
            "Company'. Address 'Hon. J.A.J. Creswell, Washington D.C.' at "
            "top, the body in a confident nineteenth-century business hand, "
            "closing 'Respectfully yours, Fredk. Douglass, Presdt.'"
        ),
        "asset_key": "frederick-douglass",
        "archival_note": (
            "Note the contrast between the ornate engraved letterhead and "
            "the plain, direct hand beneath it — the aesthetics of "
            "Reconstruction-era finance sitting above the aesthetics of a "
            "man who preferred to say things plainly."
        ),
        "archival_credit": (
            "Collection: National Museum of African American History and "
            "Culture, Smithsonian Institution. Object 2021.58.2. "
            "Rights: Public Domain / Smithsonian Open Access."
        ),
        "location": "Washington, D.C.",
    },

    # ---- 07 · SUSAN B. ANTHONY ---------------------------------------------
    {
        "title": "Letter from Susan B. Anthony",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Susan B. Anthony wrote this letter in December 1880. Written in "
            "ink on lined paper, it offers a quieter artifact of a woman "
            "whose public life is usually represented through speeches, "
            "photographs, and political history.\n\n"
            "Here, the historical figure appears simply as a person writing "
            "a letter by hand. The associated person in the museum record is "
            "Elizabeth Cady Stanton, connecting the document to the "
            "extraordinary network of women who worked together in the "
            "nineteenth-century women's rights movement."
        ),
        "era": "20 December 1880",
        "source": (
            "National Portrait Gallery, Smithsonian Institution "
            "(AD/NPG.77.49)"
        ),
        "image_description": (
            "Two pages of lined paper. The first opens 'Tenafly N.J. Dec 20/80' "
            "and is addressed to Armstrong & Co. The second closes "
            "'Respectfully yours, Susan B. Anthony.' A vertical fold and the "
            "faint impression of the reverse ink show through."
        ),
        "asset_key": "susan-b-anthony-1",
        "asset_key_secondary": "susan-b-anthony-2",
        "archival_note": (
            "Anthony's hand is unfussy and direct — the writing of someone "
            "used to correspondence as work. Compare the two pages: the "
            "opening is measured; the closing, where her signature falls, "
            "loosens."
        ),
        "archival_credit": (
            "Collection: National Portrait Gallery, Smithsonian Institution. "
            "Object AD/NPG.77.49. Medium: ink on lined paper. "
            "Rights: CC0 / public domain."
        ),
        "location": "Tenafly, New Jersey",
    },

    # ---- 08 · EADWEARD MUYBRIDGE -------------------------------------------
    {
        "title": "Letter from Eadweard Muybridge",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Eadweard Muybridge — famous for his pioneering photographic "
            "studies of motion — wrote this two-page letter to the editor "
            "of the Press in Philadelphia in 1887. The letterhead identifies "
            "Muybridge with the University of Pennsylvania and the "
            "correspondence discusses his photographic research and the "
            "publication of his work.\n\n"
            "The manuscript is particularly interesting because the writing "
            "itself belongs to the era when photography, science, "
            "publishing, and new technologies were rapidly changing how "
            "people understood movement."
        ),
        "era": "24 November 1887",
        "source": (
            "National Museum of American History, Smithsonian Institution "
            "(PG.001238)"
        ),
        "image_description": (
            "Aged brown paper under Muybridge's engraved letterhead "
            "'Eadweard Muybridge · University of Pennsylvania · "
            "Philadelphia, U.S.A.' The word 'Confidential' is underlined "
            "above the date; the body of the letter follows in a spidery, "
            "slightly leftward-leaning hand."
        ),
        "asset_key": "eadweard-muybridge",
        "archival_note": (
            "Muybridge's hand tilts backward slightly — unusual for the "
            "period. He was left-handed, which shows in the small pull of "
            "the descenders and the direction of the finishing strokes."
        ),
        "archival_credit": (
            "Collection: National Museum of American History, Smithsonian "
            "Institution. Object PG.001238. "
            "Rights: Public Domain / Smithsonian Open Access."
        ),
        "location": "Philadelphia, Pennsylvania",
    },

    # ---- 09 · DEBORAH HADDOCK ----------------------------------------------
    {
        "title": "Mrs. Deborah Haddock's Recipe Book",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "\"Mrs Deborah Haddock. Her Book December the 1 one thousand "
            "Seven Hundred and twenty.\" So begins one of the most charming "
            "objects in the Codexia archive.\n\n"
            "Compiled beginning in 1720, Deborah Haddock's recipe book "
            "contains culinary, medical, and household knowledge. Its pages "
            "include soups, pies, puddings, cakes, biscuits, preserves, "
            "household remedies, and other recipes gathered from a network "
            "of women and men.\n\n"
            "This exercise presents Deborah Haddock's Excellent Orange "
            "Pudding — an ordinary domestic recipe preserved for more than "
            "three centuries in the writer's own hand."
        ),
        "era": "1720 (early 18th century)",
        "source": "Wellcome Collection, MS.7987",
        "image_description": (
            "A single receipt-book page, brown iron-gall ink on soft "
            "handmade paper, the recipe headed 'To Meake an excelent ornge "
            "pouding — Mrs Trepshe'."
        ),
        "asset_key": "deborah-haddock",
        "archival_note": (
            "Read the old spellings aloud rather than translating them in "
            "your head — 'ornge', 'sugear', 'geather'. The book teaches "
            "eighteenth-century English by ear as much as by eye."
        ),
        "archival_credit": (
            "Manuscript: Wellcome Collection, MS.7987. Date: 1720 onward. "
            "Credit: Wellcome Collection. Rights: Public Domain Mark. "
            "The majority of culinary recipes are in Haddock's own hand."
        ),
        "location": "England",
    },

    # ---- 10 · BRIDGET HYDE -------------------------------------------------
    {
        "title": "Bridget Hyde's Receipt Book",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "\"Madam Bridget Hyde her receipt book August the 19th Anno "
            "Domini 1676.\"\n\n"
            "Bridget Hyde's receipt book is a remarkable record of domestic "
            "knowledge from the late seventeenth century. The volume "
            "contains recipes for cooking, preserves, wines, cakes, "
            "puddings, cordials, household preparations, and medical "
            "remedies, with entries continuing through 1690.\n\n"
            "This exercise presents a page containing marmalade of cherries, "
            "Martinmasse beef, and a rare jelly — three wonderfully strange "
            "fragments of seventeenth-century household life preserved "
            "together on one handwritten page. The spelling belongs to the "
            "period and is preserved rather than silently modernized."
        ),
        "era": "19 August 1676",
        "source": "Wellcome Collection, MS.2990",
        "image_description": (
            "A single leaf headed 'To Make rough Marmalet of Cherries', "
            "followed by 'To Make Martinmasse Beefe' and 'To Make a rare "
            "Jelley', in a graceful late-seventeenth-century hand with "
            "flourished capitals."
        ),
        "asset_key": "bridget-hyde",
        "archival_note": (
            "What looks like 'Marsinmajse' is Martinmasse — a reference to "
            "Martinmas, 11 November, the traditional slaughter-day. Let the "
            "manuscript teach the old spelling rather than 'correcting' it."
        ),
        "archival_credit": (
            "Manuscript: Wellcome Collection, MS.2990. Dates: 1676–1690. "
            "Credit: Wellcome Collection. Rights: Public Domain Mark."
        ),
        "location": "England",
    },

    # ---- 11 · FRANCIS — V-MAIL FROM OVERSEAS -------------------------------
    {
        "title": "A V-Mail from Overseas",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "A V-Mail written by a soldier named Francis to his mother and "
            "sisters in Iowa in the closing winter of the Second World War.\n\n"
            "V-Mail (Victory Mail) was a wartime correspondence system in "
            "which soldiers' handwritten letters were photographed onto "
            "microfilm, shipped home, and then reprinted at reduced size "
            "for delivery. The system saved cargo space and speeded "
            "delivery — at the cost of shrinking the writer's hand to a "
            "small, spidery version of itself.\n\n"
            "The letter carries the ordinary weather of ordinary people "
            "writing through an extraordinary time: seasickness, boat food, "
            "a brother in hospital, the box of cookies that never arrived, "
            "and the plainest possible closing — 'Good Luck. Love to all. "
            "Francis.'"
        ),
        "era": "23 December 1944",
        "source": "Private family collection",
        "image_description": (
            "A reduced V-Mail print showing the wartime microfilm frame in "
            "full — censor's stamp, addresses, a full page of upright "
            "American cursive, and the printed 'REPLY BY V-MAIL' bar along "
            "the foot."
        ),
        "asset_key": "vmail-francis-letter",
        "asset_key_secondary": "vmail-francis-envelope",
        "archival_note": (
            "V-Mail handwriting is a genre of its own — the writer knew the "
            "page would be shrunk, so most V-Mail is written slightly larger "
            "and more carefully than an ordinary letter. Watch how Francis "
            "keeps his lines even despite writing on a moving ship."
        ),
        "archival_credit": (
            "Source: Private family collection. Original physical V-Mail "
            "retained by the family. Digitized for Codexia & Ink with "
            "family permission."
        ),
        "location": "aboard ship, en route overseas",
    },

    # ---- 12 · LUCILLE — LETTER HOME ---------------------------------------
    {
        "title": "A Letter Home",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "A letter written from Iowa in early January 1945 by Francis's "
            "sister, Lucille, in reply to two V-Mails she had just received "
            "from him overseas.\n\n"
            "Where Francis's V-Mail is compressed by wartime microfilm, "
            "Lucille's letter is the ordinary thing itself: notebook paper, "
            "blue ink, a hole-punched margin, an easy round hand. She writes "
            "about the weather, the family car, whether they've missed "
            "school, the butchering of a beef, the pink teddy bear Floyd "
            "sent Pat for Christmas.\n\n"
            "Read alongside her brother's letter, the two documents become "
            "a tiny conversation across time and distance. The handwriting "
            "is not famous. The writers were not historical celebrities. "
            "That is precisely why it matters. This is what an ordinary "
            "American family sounded like on paper in the winter of 1944–45."
        ),
        "era": "7 January 1945",
        "source": "Private family collection",
        "image_description": (
            "A folded page of lined notebook paper opening 'Dear Francis, "
            "Received your two v.mail letters Sat Jan 6.' A relaxed round "
            "American cursive in dark blue ink."
        ),
        "asset_key": "vmail-lucille-reply",
        "archival_note": (
            "The hand is easy, unhurried, and completely un-self-conscious "
            "— the writing of someone who is used to writing letters. Watch "
            "the small habitual quirks: the way she draws the date, the "
            "capital D at the start of names, the plain full-stops."
        ),
        "archival_credit": (
            "Source: Private family collection. Original artifact retained "
            "by the family. Digitized for Codexia & Ink with family "
            "permission."
        ),
        "location": "Burlington, Iowa",
    },

    # ---- 13 · JOSEPH DELAPLAINE --------------------------------------------
    {
        "title": "Letter to Jacob Rapelye",
        "transcription_status": "study",
        "transcription": "",
        "context": (
            "Joseph Delaplaine (1777–1824) was an American artist, "
            "publisher, and portraitist active in Philadelphia during the "
            "early nineteenth century. This handwritten letter was written "
            "to Jacob Rapelye on December 26, 1811, in Philadelphia.\n\n"
            "Unlike the famous literary manuscripts in the archive, this "
            "document is a quieter example of everyday correspondence from "
            "the early Republic. Its value is in the hand itself: the ink, "
            "paper, spacing, letterforms, and physical rhythm of a person "
            "writing more than two centuries ago.\n\n"
            "The letter gives us an opportunity to encounter handwriting "
            "not as a reproduction of a printed text, but as an artifact of "
            "a particular person, place, and moment."
        ),
        "era": "26 December 1811",
        "source": (
            "National Portrait Gallery, Smithsonian Institution "
            "(AD/NPG.79.14)"
        ),
        "image_description": (
            "A single sheet of laid paper, opening 'Philada Decr 26 1811 · "
            "Dear Sir', a fluent early-Republic hand with generous "
            "flourishes on the capitals, closing with a large signature "
            "'Joseph Delaplaine' and a smaller line 'Mr Jacob Rapelye' "
            "below."
        ),
        "asset_key": "joseph-delaplaine",
        "archival_note": (
            "Delaplaine's hand is a study in confident everyday "
            "penmanship of the early Republic — quick round bodies on the "
            "lowercase, dramatic descending loops on the y and g, the D of "
            "the signature nearly ornamental. This is what a working "
            "American of 1811 looked like on paper when he was writing "
            "to a friend."
        ),
        "archival_credit": (
            "Collection: National Portrait Gallery, Smithsonian "
            "Institution. Object AD/NPG.79.14. Author: Joseph Delaplaine. "
            "Addressee: Jacob Rapelye. Medium: ink on paper. "
            "Rights: CC0 / Public Domain."
        ),
        "location": "Philadelphia, Pennsylvania",
    },
]


# ---------- Helpers ----------
def _strip_id(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


def _today_iso() -> str:
    return datetime.now(timezone.utc).date().isoformat()


# ---------- Seed ----------
@app.on_event("startup")
async def seed_content():
    """Seed curated content idempotently."""
    existing = await db.content_library.count_documents({})
    if existing == 0:
        for piece in CURATED_CONTENT:
            doc = ContentPiece(
                **piece,
                word_count=len(piece["body"].split()),
                estimated_minutes=max(2, min(8, len(piece["body"].split()) // 12)),
            ).dict()
            await db.content_library.insert_one(doc)
        logging.info(f"Seeded {len(CURATED_CONTENT)} content pieces.")

    # Always re-seed historical documents to ensure latest authentic
    # manuscript facsimiles are present. This is a small curated set so cost
    # is negligible. We reseed whenever the count changes, whenever the first
    # document's identity drifts, or whenever a document is missing the
    # `transcription_status` field (indicating a schema migration).
    existing_count = await db.historical_documents.count_documents({})
    existing_first = await db.historical_documents.find_one({}, {"_id": 0, "title": 1, "asset_key": 1})
    existing_missing_status = await db.historical_documents.find_one(
        {"transcription_status": {"$exists": False}}, {"_id": 0, "title": 1}
    )
    expected_first = CURATED_DOCUMENTS[0]
    needs_reseed = (
        existing_count != len(CURATED_DOCUMENTS)
        or not existing_first
        or existing_first.get("title") != expected_first["title"]
        or existing_first.get("asset_key") != expected_first.get("asset_key")
        or existing_missing_status is not None
    )
    if needs_reseed:
        await db.historical_documents.delete_many({})
        for d in CURATED_DOCUMENTS:
            doc = HistoricalDocument(**d).dict()
            await db.historical_documents.insert_one(doc)
        logging.info(f"Re-seeded {len(CURATED_DOCUMENTS)} historical documents (authentic facsimiles).")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Cursive — a sanctuary for deep thought.", "version": "1.0.0"}


@api_router.get("/content", response_model=List[ContentPiece])
async def list_content(category: Optional[str] = None, limit: int = 100):
    query = {"category": category} if category else {}
    cursor = db.content_library.find(query, {"_id": 0}).limit(limit)
    return [ContentPiece(**doc) async for doc in cursor]


@api_router.get("/content/categories")
async def list_categories():
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    cursor = db.content_library.aggregate(pipeline)
    result = []
    async for doc in cursor:
        result.append({"category": doc["_id"], "count": doc["count"]})
    return {"categories": sorted(result, key=lambda x: x["category"])}


@api_router.get("/content/{content_id}", response_model=ContentPiece)
async def get_content(content_id: str):
    doc = await db.content_library.find_one({"id": content_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Content not found")
    return ContentPiece(**doc)


@api_router.get("/archive", response_model=List[HistoricalDocument])
async def list_archive():
    cursor = db.historical_documents.find({}, {"_id": 0})
    return [HistoricalDocument(**doc) async for doc in cursor]


@api_router.get("/archive/{doc_id}", response_model=HistoricalDocument)
async def get_archive_doc(doc_id: str):
    doc = await db.historical_documents.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Document not found")
    return HistoricalDocument(**doc)


@api_router.post("/sessions", response_model=WritingSession)
async def create_session(payload: WritingSessionCreate):
    session = WritingSession(**payload.dict())
    await db.writing_sessions.insert_one(session.dict())
    return session


@api_router.get("/sessions/{user_id}", response_model=List[WritingSession])
async def list_sessions(user_id: str, limit: int = 50):
    cursor = db.writing_sessions.find({"user_id": user_id}, {"_id": 0}).sort("completed_at", -1).limit(limit)
    return [WritingSession(**doc) async for doc in cursor]


@api_router.get("/progress/{user_id}", response_model=ProgressStats)
async def get_progress(user_id: str):
    sessions: List[Dict[str, Any]] = await db.writing_sessions.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=10000)

    total_sessions = len(sessions)
    total_seconds = sum(s.get("duration_seconds", 0) for s in sessions)
    total_minutes = total_seconds // 60
    total_words = sum(s.get("word_count", 0) for s in sessions)

    # Sessions by content_type as a proxy for category
    by_cat: Dict[str, int] = {}
    for s in sessions:
        cat = s.get("content_type", "freewrite")
        by_cat[cat] = by_cat.get(cat, 0) + 1

    # Streak calculation (consecutive days with at least one session)
    dates_set = set()
    for s in sessions:
        try:
            ts = s.get("completed_at", "")
            d = datetime.fromisoformat(ts.replace("Z", "+00:00")).date()
            dates_set.add(d.isoformat())
        except Exception:
            continue

    today = datetime.now(timezone.utc).date()
    current_streak = 0
    cursor_date = today
    # If user wrote today, start counting from today; else from yesterday
    if cursor_date.isoformat() not in dates_set:
        cursor_date = today - timedelta(days=1)
    while cursor_date.isoformat() in dates_set:
        current_streak += 1
        cursor_date = cursor_date - timedelta(days=1)

    # Longest streak
    sorted_dates = sorted(dates_set)
    longest = 0
    run = 0
    prev = None
    for ds in sorted_dates:
        d = datetime.fromisoformat(ds).date()
        if prev is not None and (d - prev).days == 1:
            run += 1
        else:
            run = 1
        longest = max(longest, run)
        prev = d

    last_at = None
    if sessions:
        last_at = max(sessions, key=lambda x: x.get("completed_at", ""))["completed_at"]

    return ProgressStats(
        total_sessions=total_sessions,
        total_minutes=total_minutes,
        total_words=total_words,
        current_streak=current_streak,
        longest_streak=longest,
        sessions_by_category=by_cat,
        last_session_at=last_at,
    )


@api_router.post("/profiles", response_model=Profile)
async def create_or_update_profile(payload: ProfileCreate):
    existing = await db.profiles.find_one({"user_id": payload.user_id}, {"_id": 0})
    if existing:
        update_fields = {k: v for k, v in payload.dict().items() if v is not None}
        await db.profiles.update_one({"user_id": payload.user_id}, {"$set": update_fields})
        merged = {**existing, **update_fields}
        return Profile(**merged)
    profile = Profile(**payload.dict())
    await db.profiles.insert_one(profile.dict())
    return profile


@api_router.get("/profiles/{user_id}", response_model=Profile)
async def get_profile(user_id: str):
    doc = await db.profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Profile not found")
    return Profile(**doc)


@api_router.post("/favorites", response_model=Favorite)
async def add_favorite(payload: FavoriteCreate):
    existing = await db.favorites.find_one(
        {"user_id": payload.user_id, "content_id": payload.content_id}, {"_id": 0}
    )
    if existing:
        return Favorite(**existing)
    fav = Favorite(**payload.dict())
    await db.favorites.insert_one(fav.dict())
    return fav


@api_router.delete("/favorites")
async def remove_favorite(user_id: str, content_id: str):
    await db.favorites.delete_one({"user_id": user_id, "content_id": content_id})
    return {"removed": True}


@api_router.get("/favorites/{user_id}", response_model=List[Favorite])
async def list_favorites(user_id: str):
    cursor = db.favorites.find({"user_id": user_id}, {"_id": 0})
    return [Favorite(**doc) async for doc in cursor]


@api_router.post("/penpal/signup", response_model=PenpalEntry)
async def penpal_signup(payload: PenpalSignup):
    existing = await db.penpal_waitlist.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return PenpalEntry(**existing)
    entry = PenpalEntry(**payload.dict())
    await db.penpal_waitlist.insert_one(entry.dict())
    return entry


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
