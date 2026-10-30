# 🏨 WanderStay — AI-Powered Hotel Host Verification Platform

**WanderStay** is a full-stack hotel discovery and host verification platform that integrates Generative AI and Retrieval-Augmented Generation (RAG) to streamline the preliminary verification of hotel hosts.

Beyond traditional property listing functionality, WanderStay features an **AI-assisted document verification pipeline** that extracts information from uploaded business licenses, retrieves relevant licensing and hotel-safety regulations, and generates structured recommendations for administrators.

The core of the project is a **Hybrid RAG Architecture combining Semantic Vector Search, BM25 Keyword Retrieval, and Reciprocal Rank Fusion (RRF)** to improve the relevance and ranking of retrieved regulatory information.

🌐 **Live Application:** https://wander-stay-beta.vercel.app/listings

---

## 🚀 Core Features

### 1. Property Discovery & Management
- Browse and explore hotel and property listings.
- Create, edit, and delete property listings.
- Upload property images using Cloudinary.
- Search and discover available properties.
- Add ratings and reviews.

### 2. Authentication & Authorization
- User registration, login, and logout.
- Passport.js Local Strategy for authentication.
- Session-based authentication using Express Session.
- MongoDB-backed session persistence using Connect-Mongo.
- Protected routes and ownership-based access control.

### 3. AI-Assisted Host Verification
- Hosts submit business license documents during registration for host verification.
- License images are uploaded using Multer and Cloudinary.
- Google Gemini Vision extracts structured information from license images.
- Extracted fields include business name, license number, issue date, expiry date, and business address.
- RAG retrieves relevant licensing and hotel-safety guidelines.
- Gemini generates structured verification recommendations.
- Admin dashboard displays extracted information, retrieved sources, and AI-generated recommendations.
- Administrators retain the final approval or rejection authority.

---

# 🧠 AI ENGINEERING — HYBRID RAG PIPELINE

This is the core intelligence layer of WanderStay.

## 1. Why RAG?

Traditional LLMs generate responses using their learned knowledge. However, they may not have access to the specific licensing requirements and hotel-safety guidelines maintained by an application.

Using an LLM alone can also lead to hallucinations or unsupported recommendations.

**Retrieval-Augmented Generation (RAG)** addresses this by retrieving relevant information from an external knowledge base and providing it to the LLM as context before generating a response.

In WanderStay, RAG enables the system to:
- Retrieve project-specific licensing and safety guidelines.
- Ground AI recommendations in retrieved regulatory passages.
- Update the knowledge base without retraining the LLM.
- Provide source-document references for administrator review.

## 2. Knowledge Base Preparation

The knowledge base contains four regulatory and guideline documents:

| Document | Purpose |
|---|---|
| `government_rules.txt` | Government and business licensing guidance |
| `hotel_guidelines.txt` | Hotel-related guidelines |
| `license_requirements.txt` | License and supporting-document requirements |
| `fire_safety_rules.txt` | Fire-safety regulations and guidance |

These documents are processed before retrieval to create searchable knowledge chunks.

## 3. Document Chunking

Long documents are divided into smaller passages called **chunks**.

Why chunking?
- Retrieving an entire document may introduce irrelevant information.
- Smaller chunks provide focused and contextually relevant passages.
- Chunking reduces unnecessary prompt size.
- Overlap helps preserve context between adjacent chunks.

**Implementation details:**

| Parameter | Configuration |
|---|---|
| Chunking strategy | Paragraph-aware splitting |
| Target chunk size | ~400 characters |
| Chunk overlap | 50 characters |
| Validated knowledge chunks | 13 |
| Metadata | Source filename and chunk index |

Each chunk retains metadata to support deduplication and source traceability.

## 4. Embeddings & Vector Search

### What are embeddings?

Embeddings are numerical representations of text that capture semantic meaning.

For example, the following queries may have similar meanings:

- "What are the hotel fire safety requirements?"
- "Which safety regulations must a hotel follow?"

Although the wording differs, an embedding model can map semantically related text into nearby regions of a vector space.

### Implementation

- **Embedding Model:** `gemini-embedding-001`
- **Embedding Dimension:** 3072
- **Similarity Metric:** Cosine Similarity
- **Vector Storage:** Local JSON-based vector store (`vectorDB/embeddings.json`)

Each knowledge chunk is converted into a 3072-dimensional vector and stored along with its original text and metadata.

During a query:
1. The query is converted into an embedding.
2. Its vector is compared with stored chunk embeddings.
3. Cosine similarity ranks semantically related chunks.
4. The most relevant candidates are returned.

### Why Cosine Similarity?

Cosine similarity measures the angle between two vectors rather than their absolute magnitudes.

A higher cosine similarity indicates stronger directional similarity between the query and a document embedding.

However, similarity is a retrieval signal, not a probability that the retrieved information or final recommendation is correct.

## 5. Hybrid Retrieval — Vector Search + BM25

### Why did we introduce Hybrid Search?

Our initial approach used vector-only retrieval.

While semantic search is effective at identifying paraphrased queries, it can under-rank exact identifiers, license numbers, acronyms, and specific regulatory terminology.

For document verification, both semantic understanding and exact keyword matching are important.

To address this limitation, we introduced **Hybrid Retrieval**.

It combines two complementary retrieval mechanisms:

**A. Semantic Vector Search**

- Uses embeddings to understand the meaning of queries.
- Retrieves semantically related passages.
- Handles paraphrased queries even when exact words differ.

**B. BM25 Keyword Search**

BM25 is a probabilistic lexical ranking algorithm used in information retrieval.

It considers factors such as:
- Term Frequency (TF): How frequently a query term appears in a document.
- Inverse Document Frequency (IDF): How informative or rare a term is across the collection.
- Document Length Normalization: Adjusts scores based on document length.

BM25 is particularly useful for exact terms, identifiers, acronyms, and licensing terminology.

### 6. Reciprocal Rank Fusion (RRF)

Vector Search and BM25 produce separate ranked result lists. However, their raw scores are not directly comparable because they use different scoring mechanisms.

Instead of adding their raw scores, WanderStay uses **Reciprocal Rank Fusion (RRF)**.

RRF combines ranked lists using the following formula:

$$
RRF(d) = \sum_{r \in R} \frac{1}{k + rank_r(d)}
$$

Where:

- \(d\) = Retrieved document/chunk.
- \(R\) = Set of retrieval systems.
- \(rank_r(d)\) = Rank of document \(d\) in retriever \(r\).
- \(k\) = Constant, configured as 60.

**How it works:**

1. Vector Search returns its ranked chunks.
2. BM25 returns its ranked chunks.
3. RRF calculates a combined score using each chunk's rank.
4. Chunks appearing highly in either list receive stronger fused scores.
5. Results are deduplicated using source filename and chunk index.
6. The highest-ranked chunks are selected as context for generation.

**Why RRF instead of directly combining scores?**

Because vector similarity scores and BM25 scores operate on different scales. RRF uses ranking positions instead of comparing incompatible raw scores.

This makes the fusion process simpler and avoids manually calibrating the two scoring systems.

## 7. Generative AI & Prompt Engineering

After retrieval, the system constructs a context containing:

- Extracted business license information in JSON format.
- Relevant retrieved regulatory passages.
- Source filenames and supporting text.
- Instructions defined in the RAG prompt.

The context is passed to Google Gemini through the `@google/genai` SDK.

The model generates a structured assessment with possible outcomes:

- `Approved`
- `Rejected`
- `Manual Review`

The response includes:
- Recommendation status.
- Reasoning behind the recommendation.
- Retrieval-derived confidence/similarity signal.
- Retrieved source filenames.

The backend parses the model response and persists the analysis in MongoDB.

**Important:** The displayed confidence signal is derived from retrieval similarity. It is not a calibrated probability of recommendation correctness.

## 8. End-to-End RAG Workflow

```text
         BUSINESS LICENSE IMAGE
                   |
                   v
           Multer + Cloudinary
                   |
                   v
           GEMINI VISION OCR
                   |
                   v
        STRUCTURED LICENSE FIELDS
          (JSON EXTRACTION)
                   |
                   v
          BUILD SEARCH QUERY
                   |
          +--------+--------+
          |                 |
          v                 v
     VECTOR SEARCH       BM25 SEARCH
     (Embeddings)        (Keywords)
          |                 |
          v                 v
     Semantic Ranking   Lexical Ranking
          |                 |
          +--------+--------+
                   |
                   v
          RECIPROCAL RANK
             FUSION
                   |
                   v
         DEDUPLICATION &
         TOP-K SELECTION
                   |
                   v
         CONTEXT CONSTRUCTION
                   |
                   v
          GEMINI GENERATION
                   |
                   v
       STRUCTURED RECOMMENDATION
                   |
                   v
           MONGODB STORAGE
                   |
                   v
          ADMIN DASHBOARD
                   |
                   v
          HUMAN FINAL REVIEW
```

---

# 📊 RETRIEVAL EVALUATION

To evaluate the improvement introduced by Hybrid Search, we compared the original vector-only retrieval approach against Hybrid Retrieval using a manually labeled benchmark of eight queries.

| Evaluation Metric | Vector-Only | Hybrid Retrieval |
|---|---:|---:|
| Recall@4 | 100% | 100% |
| Mean Reciprocal Rank (MRR) | 0.938 | **1.000** |

### Understanding the Metrics

**Recall@4**

Measures whether the expected relevant chunks appear within the top four retrieved results.

Both approaches achieved 100% Recall@4 in the evaluated benchmark.

**Mean Reciprocal Rank (MRR)**

Measures how highly the first relevant result appears in the ranked list.

\[
MRR=\frac{1}{N}\sum_{i=1}^{N}\frac{1}{rank_i}
\]

A higher MRR means relevant results appear earlier.

### Key Observation

Hybrid Retrieval improved MRR from 0.938 to 1.000 while maintaining 100% Recall@4.

This indicates improved ranking of relevant chunks in our eight-query benchmark.

*These are preliminary retrieval results from a small manually labeled dataset. They do not establish 100% accuracy of AI-generated verification decisions.*

---

# 🏗️ SYSTEM ARCHITECTURE

WanderStay is organized into five cooperating layers:

| Layer | Technologies | Responsibility |
|---|---|---|
| Presentation | EJS, ejs-mate, HTML, CSS, Bootstrap | Renders user, host, listing, and admin interfaces |
| Application | Node.js, Express.js | Handles routes, controllers, middleware, and business logic |
| Persistence | MongoDB, Mongoose | Stores users, listings, reviews, sessions, and AI analysis |
| File Storage | Multer, Cloudinary | Handles document and listing image uploads |
| AI & Retrieval | Gemini Vision, Gemini Embeddings, BM25, RRF | Performs extraction, retrieval, fusion, and recommendation generation |

---

# 🛠️ TECHNOLOGY STACK — WHY THESE TECHNOLOGIES?

| Technology | Role in WanderStay | Why it was used |
|---|---|---|
| Node.js | Backend runtime | JavaScript-based server-side development and I/O handling |
| Express.js | Backend framework | Lightweight routing and middleware architecture |
| EJS | Frontend templating | Server-rendered dynamic pages |
| ejs-mate | Template layouts | Reusable layouts and template structure |
| MongoDB | Database | Flexible document-oriented data storage |
| Mongoose | ODM | Schema definitions, validation, and database interaction |
| Passport.js | Authentication | Local username/password authentication |
| Express Session | Session management | Maintains authenticated state across requests |
| Connect-Mongo | Session storage | Persists sessions in MongoDB |
| Multer | File uploads | Processes multipart/form-data uploads |
| Cloudinary | Media storage | Hosted storage and URL-based access for images |
| Gemini Vision | Document extraction | Extracts structured information from license images |
| Gemini Embeddings | Semantic retrieval | Converts queries and knowledge chunks into vectors |
| BM25 | Keyword retrieval | Matches exact terms and licensing identifiers |
| RRF | Rank fusion | Combines semantic and lexical retrieval rankings |
| Gemini LLM | Generation | Produces context-grounded structured recommendations |
| Axios | HTTP requests | Handles external HTTP requests |
| dotenv | Configuration | Loads environment variables |
| Joi | Validation | Validates incoming application data |
| Connect Flash | User feedback | Displays one-time success and error messages |
| method-override | HTTP methods | Supports PUT and DELETE operations through forms |

### Why MongoDB instead of MySQL?

MongoDB provides flexible document-oriented storage that fits the JavaScript-based application and its listing, user, and analysis records. Mongoose adds schema definitions and validation.

A relational database such as PostgreSQL or MySQL would also be suitable if complex joins and strict relational constraints were the primary requirement.

### Why EJS instead of React?

EJS supports server-side rendering and reusable layouts, keeping the frontend architecture relatively simple for this application.

A separate React frontend could support richer client-side interactions but would introduce additional API and state-management complexity.

### Why Cloudinary instead of local storage?

Cloudinary provides hosted image storage and accessible image URLs. It avoids depending on the application's local filesystem for persistent media storage.

### Why a JSON Vector Store?

The knowledge base is small, so a local JSON-backed vector store is simple to inspect, validate, and rebuild.

For larger datasets, a dedicated vector database such as FAISS, Chroma, Qdrant, Pinecone, or pgvector would provide more scalable indexing and retrieval capabilities.

---

# 📂 PROJECT STRUCTURE

```text
WanderStay/
│
├── Models/
│   ├── listing.js
│   ├── reviews.js
│   └── user.js
│
├── controllers/
│   ├── admin.js
│   ├── listing.js
│   ├── reviews.js
│   └── user.js
│
├── routes/
│   ├── admin.js
│   ├── ai.js
│   ├── host.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── services/
│   ├── chunker.js
│   ├── embeddings.js
│   ├── gemini.js
│   ├── rag.js
│   ├── retriever.js
│   └── vectorStore.js
│
├── documents/
│   ├── government_rules.txt
│   ├── hotel_guidelines.txt
│   ├── license_requirements.txt
│   └── fire_safety_rules.txt
│
├── vectorDB/
│   └── embeddings.json
│
├── views/
│   ├── admin/
│   ├── host/
│   ├── listings/
│   ├── users/
│   ├── includes/
│   └── layouts/
│
├── public/
│   ├── css/
│   └── js/
│
├── cloudConfig.js
├── middleware.js
├── schema.js
├── app.js
├── initVectorDB.js
├── package.json
└── README.md
```

---

# ⚙️ INSTALLATION & SETUP

### Prerequisites

- Node.js v20.9.0
- npm
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Preksha0401/WanderStay.git

cd WanderStay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory.

```env
ATLASDB_URL=your_mongodb_connection_string

SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

### 4. Initialize the vector database

```bash
node initVectorDB.js
```

This processes the knowledge documents, generates embeddings, and stores the resulting vectors in `vectorDB/embeddings.json`.

### 5. Start the application

```bash
npm start
```

Visit:

```text
http://localhost:8080
```

---

# 🧪 TESTING & VALIDATION

The following validations were documented during project development:

- Embedding store integrity: 13 chunks, 3072 dimensions, zero invalid records.
- Embedding retry behavior: 3/3 tests passed.
- Retrieval evaluation: Eight manually labeled queries.
- End-to-end validation: Successful license image download, Gemini extraction, RAG retrieval, recommendation generation, and MongoDB persistence.

---

# ⚠️ LIMITATIONS & RESPONSIBLE AI

- OCR does not establish whether a business license is genuine.
- Regulatory sources require jurisdiction and currency validation.
- Incorrect or incomplete retrieval can affect generated recommendations.
- LLM responses may contain errors or malformed JSON.
- Retrieval similarity is not a calibrated measure of answer correctness.
- External API failures, rate limits, and network delays can interrupt processing.
- Human administrators retain final verification and approval authority.

---

# 🔮 FUTURE ENHANCEMENTS

- Integrate official government registries for license authenticity checks.
- Replace the local JSON vector store with a dedicated vector database as the corpus grows.
- Introduce jurisdiction-based metadata filtering.
- Expand the manually labeled retrieval benchmark.
- Add schema validation for AI-generated JSON responses.
- Improve OCR handling for low-resolution and rotated documents.
- Introduce source versioning and regulatory document updates.
- Add stronger monitoring, logging, and API failure handling.

---

# 👩‍💻 AUTHOR

**Preksha Pravin Salvi**

B.Tech – Computer Engineering  
Sardar Patel Institute of Technology, Mumbai

- GitHub: [Preksha0401](https://github.com/Preksha0401)
- Live Project: [WanderStay](https://wander-stay-beta.vercel.app/listings)

---

⭐ If you find this project interesting, consider giving the repository a star!
