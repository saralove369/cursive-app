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
    transcription: str
    context: str
    era: str
    source: Optional[str] = None
    image_description: str  # description of what historical doc looks like
    image_url: Optional[str] = None  # facsimile image
    archival_note: Optional[str] = None  # short note for the manuscript room
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
    {
        "title": "Wild Nights — Wild Nights!",
        "transcription": "Wild nights — Wild nights! Were I with thee Wild nights should be Our luxury! Futile — the winds — To a heart in port — Done with the compass — Done with the chart!",
        "context": "An autograph manuscript of one of Emily Dickinson's most quietly incendiary poems. She was thirty when she copied it onto folded sheets that she stitched into the small hand-sewn booklets — fascicles — in which she kept her work for herself.",
        "era": "circa 1861",
        "source": "Houghton Library, Harvard",
        "image_description": "Folded letter-paper, soft violet-grey ink, dashes that pause the eye, the word 'Wild' lifting like a small flag at the top.",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Emily_Dickinson_%22Wild_nights%22_manuscript.jpg/800px-Emily_Dickinson_%22Wild_nights%22_manuscript.jpg",
        "archival_note": "Notice how the dashes are not punctuation but breath — short ones lean forward, long ones stretch the line. Dickinson punctuated by handwriting before she punctuated by grammar.",
        "location": "Amherst, Massachusetts",
    },
    {
        "title": "Letter to Cassandra",
        "transcription": "My dear Cassandra, I have received your letter, and I thank you for it. I am very glad you are returned safe from your journey; you have suffered, I am afraid, more than was needful. The weather here is fine. I hope it is the same with you.",
        "context": "Jane Austen wrote nearly weekly to her elder sister Cassandra throughout her life. This letter, sent from Bath in May 1801, is part of the small surviving correspondence between them — Cassandra burned most of the rest after Jane's death, an act of editorial love whose loss the world has not quite forgiven.",
        "era": "12 May 1801",
        "source": "Morgan Library & Museum, New York",
        "image_description": "Small folded sheet, even slightly forward-leaning hand, the lines tight and economical, the page near-full because paper was expensive and a sister's words were not.",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Letter_to_Cassandra_Austen%2C_by_Jane_Austen%2C_Bath%2C_12_May_1801_-_Morgan_Library_%26_Museum_-_New_York_City_-_DSC06587.jpg/800px-Letter_to_Cassandra_Austen%2C_by_Jane_Austen%2C_Bath%2C_12_May_1801_-_Morgan_Library_%26_Museum_-_New_York_City_-_DSC06587.jpg",
        "archival_note": "Austen's hand is the trained Italian hand of a gentlewoman of her generation — slender, slanted, with very little space between lines. To save paper, she occasionally 'crossed' her letters, writing a second page sideways across the first.",
        "location": "Bath, England",
    },
    {
        "title": "Letter from Arles",
        "transcription": "My dear Bernard, I am writing to you from the Yellow House. The light here is unlike any light I have known. It is very hot. The cicadas sing all day long. I am painting wheatfields. Write to me.",
        "context": "Vincent van Gogh wrote constantly to his friend Émile Bernard during his fevered Arles period of 1888. He used letters the way he used canvases — to test ideas, to ask, to be less alone. The transcription here is paraphrased from his April letter; the original is in his looping, urgent French.",
        "era": "April 1888",
        "source": "Morgan Library & Museum, New York",
        "image_description": "A page densely written in a quick, slightly forward-leaning hand, the margins generous, occasional small thumbnail sketches drifting between the paragraphs.",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Gogh_-_Autograph_letter_signed_Arles%2C_to_%C3%89mile_Bernard%2C_ca._1888_Apr._12%2C_MA_6441.3.jpg/800px-Gogh_-_Autograph_letter_signed_Arles%2C_to_%C3%89mile_Bernard%2C_ca._1888_Apr._12%2C_MA_6441.3.jpg",
        "archival_note": "Watch how Van Gogh's letterforms speed up and slow down across the page — the lines bunch where he is excited, open where he is thinking. He drew while he wrote; his correspondence is a kind of sketchbook.",
        "location": "Arles, Provence",
    },
    {
        "title": "From a Botanist's Hand",
        "transcription": "Monsieur, I send you herewith the seeds you requested. The Rosa noisettiana flowers most abundantly this season. Should you require cuttings of the new climber, write to me before the first frost.",
        "context": "Louis Noisette was a celebrated nineteenth-century French nurseryman, the brother of the American breeder who gave the Noisette rose its name. His correspondence — meticulous, generous, full of soil and weather — survives in scattered archives, mostly in the Wellcome Collection and the libraries of the great botanical gardens.",
        "era": "early 19th century",
        "source": "Wellcome Collection",
        "image_description": "Rich cream paper, copperplate hand with elegant looping ascenders, a signature that flourishes into a small drawn vine at the foot of the page.",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Signed_autograph_letter_by_Louis_Noisette%2C_19th_c._Wellcome_L0075107.jpg/800px-Signed_autograph_letter_by_Louis_Noisette%2C_19th_c._Wellcome_L0075107.jpg",
        "archival_note": "Botanists' letters are a small genre of their own — the handwriting tends to be precise (because plant names must be), but warm (because the writer is, almost without exception, in love with what they are writing about).",
        "location": "Paris",
    },
    {
        "title": "From a Receipt Book",
        "transcription": "To make a fine raspberry cordial. Take of fresh raspberries two pounds, of fine sugar one pound. Crush in a stone jar and let stand four days, stirring once each morning. Strain through linen and bottle. It will keep all winter.",
        "context": "An English household manuscript of culinary and medical 'receipts' — what we would now call recipes — kept and added to across generations. Such books often passed from mother to daughter and contain the small archaeology of a household: a cure for a cough, a stain remedy, a Christmas cake, a love-token sweet.",
        "era": "circa 1700–1800",
        "source": "Wellcome Collection",
        "image_description": "Open page-spread of an old receipt book, multiple hands across the years, brown iron-gall ink that has bled gently into the soft handmade paper.",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/English_culinary_and_medical_recipe_book_Wellcome_L0050232.jpg/800px-English_culinary_and_medical_recipe_book_Wellcome_L0050232.jpg",
        "archival_note": "Observe the difference in hands — at least three women wrote in this book over fifty years. The earliest hand is the most flourished; the later ones plainer. Domestic handwriting tends, across generations, toward greater speed and less ornament.",
        "location": "England",
    },
    {
        "title": "Safe in their Alabaster Chambers",
        "transcription": "Safe in their Alabaster Chambers — Untouched by Morning — And untouched by noon — Sleep the meek members of the Resurrection — Rafter of Satin and Roof of Stone.",
        "context": "An autograph copy of one of Emily Dickinson's most-revised poems. She wrote at least five versions of these opening stanzas over a decade, sending different drafts to different correspondents and stitching her favoured version into Fascicle Six.",
        "era": "1862",
        "source": "Digital Commonwealth (Boston Public Library)",
        "image_description": "Ivory paper, slim columnar lines, the long horizontal dashes Dickinson loved, an inkwell that runs slightly thin near the bottom of the page.",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emily_Dickinson%2C_Amherst%2C_Mass.%2C_autograph_manuscript_poem%2C_Safe_in_their_Alabaster_Chamber%2C_1862%2C_from_the_Digital_Commonwealth_-_1_commonwealth_kh04mv67t.jpg/800px-Emily_Dickinson%2C_Amherst%2C_Mass.%2C_autograph_manuscript_poem%2C_Safe_in_their_Alabaster_Chamber%2C_1862%2C_from_the_Digital_Commonwealth_-_1_commonwealth_kh04mv67t.jpg",
        "archival_note": "Compare this hand with 'Wild nights' — five years apart, the same writer. The slant is steeper here, the dashes more emphatic. Handwriting is a slow self-portrait.",
        "location": "Amherst, Massachusetts",
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

    # Always re-seed historical documents to ensure latest authentic Wikimedia
    # facsimiles are present; this is a small curated set so cost is negligible.
    existing_count = await db.historical_documents.count_documents({})
    existing_first = await db.historical_documents.find_one({}, {"_id": 0, "image_url": 1, "title": 1})
    expected_first = CURATED_DOCUMENTS[0]
    needs_reseed = (
        existing_count != len(CURATED_DOCUMENTS)
        or not existing_first
        or existing_first.get("title") != expected_first["title"]
        or existing_first.get("image_url") != expected_first["image_url"]
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
