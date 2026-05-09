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
        "title": "Diary, October 1872",
        "transcription": "The morning was uncommonly fine. I walked as far as the elm by the river and watched the light upon the water. I thought of you.",
        "context": "From the personal diary of an unknown English country gentlewoman.",
        "era": "1872",
        "source": "Private Collection",
        "image_description": "Aged ivory paper with looping copperplate handwriting in deep brown ink, slight foxing at the edges.",
    },
    {
        "title": "Receipt for a Cordial",
        "transcription": "Take of fresh raspberries one quart, of fine sugar a pound and half. Crush and let stand in a stone jar. After three days, strain through linen.",
        "context": "From a household manuscript of preserves and cordials, kept by generations of women in a Cornish farmhouse.",
        "era": "circa 1850",
        "source": "Family Archive",
        "image_description": "Cream-colored paper with even Spencerian script, occasional ink blotches, a faint stain of fruit juice in the margin.",
    },
    {
        "title": "Letter, Paris, 1889",
        "transcription": "Mon cher ami, the city is in love with itself this spring. I have walked along the Seine until my feet ached. I miss you, but only sometimes.",
        "context": "An expatriate letter, written from a small apartment near the Tuileries.",
        "era": "1889",
        "source": "Belle Époque Collection",
        "image_description": "Thin onionskin paper, slanted feminine cursive, the slight imprint of a previous letter showing through.",
    },
    {
        "title": "Notebook of a Naturalist",
        "transcription": "The wren returned to the hedgerow this morning. I observed her three separate times before noon. The light was a pale and silver thing.",
        "context": "A page from the field notebook of a Victorian amateur naturalist.",
        "era": "1894",
        "source": "Naturalist Society Archive",
        "image_description": "Small notebook page with neat upright cursive, a tiny ink sketch of a wren in the margin.",
    },
    {
        "title": "A Mother's Letter",
        "transcription": "My dearest, do not forget to write. Sleep well. Eat the soup. The world is large but you are not alone in it. I am with you in every sentence.",
        "context": "From a mother to a son away at university.",
        "era": "circa 1910",
        "source": "Private Family Papers",
        "image_description": "Soft warm paper, gentle rounded cursive, a single tear stain near the closing.",
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

    docs_existing = await db.historical_documents.count_documents({})
    if docs_existing == 0:
        for d in CURATED_DOCUMENTS:
            doc = HistoricalDocument(**d).dict()
            await db.historical_documents.insert_one(doc)
        logging.info(f"Seeded {len(CURATED_DOCUMENTS)} historical documents.")


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
