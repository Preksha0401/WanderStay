# 🏨 WanderStay – AI Powered Hotel Booking & Host Verification Platform

WanderStay is a full-stack hotel booking platform inspired by Airbnb that allows users to explore properties, book stays, and apply to become verified hotel hosts.

Unlike traditional booking platforms, WanderStay includes an **AI-assisted Host Verification System** that automatically analyzes uploaded business licenses using **Google Gemini Vision** and validates them against government regulations using a **Retrieval-Augmented Generation (RAG)** pipeline.

---

## 🚀 Features

### 👤 User Features

- User Registration & Login
- Secure Authentication with Passport.js
- Browse Hotel Listings
- Search & Explore Destinations
- Add/Edit/Delete Listings
- Upload Property Images
- Review & Rating System

---

### 🏨 Host Verification Workflow

Users can apply to become hotel hosts by uploading their business license.

Workflow:

```text
User
   │
   ▼
Become Host
   │
   ▼
Upload Business License
   │
   ▼
Cloudinary Storage
   │
   ▼
Admin Dashboard
```

---

### 🤖 AI-Powered License Verification

Instead of manually inspecting every uploaded license, WanderStay performs AI-assisted verification.

Workflow:

```text
Business License Image
          │
          ▼
Google Gemini Vision OCR
          │
          ▼
Extract Structured Information
          │
          ▼
MongoDB
```

The system extracts:

- Business Name
- License Number
- Issue Date
- Expiry Date
- Business Address

---

## 🧠 Retrieval Augmented Generation (RAG)

After OCR, the extracted license information is validated using a custom RAG pipeline.

Architecture:

```text
License Information
        │
        ▼
Create Query
        │
        ▼
Embeddings
        │
        ▼
Vector Store
        │
        ▼
Similarity Search
        │
        ▼
Retrieve Government Rules
        │
        ▼
Gemini Reasoning
        │
        ▼
AI Recommendation
```

The AI retrieves the most relevant government regulations before generating recommendations.

Possible outputs:

- ✅ Approve
- ⚠ Manual Review
- ❌ Reject

---

## 📚 Knowledge Base

The RAG system retrieves information from multiple domain-specific documents.

- Government Rules
- Hotel Guidelines
- Fire Safety Rules
- License Requirements

---

## ⚙ AI Recommendation Dashboard

The Admin Dashboard displays:

- Uploaded License Preview
- AI Extracted Data
- Confidence Score
- Retrieved Rules
- AI Recommendation
- Approval / Rejection Controls

The admin always has the **final decision**, ensuring a Human-in-the-Loop verification process.

---

# 🏗 System Architecture

```text
                     WanderStay

User
 │
 ▼
Authentication
 │
 ▼
Become Host
 │
 ▼
Upload License
 │
 ▼
Cloudinary
 │
 ▼
Gemini Vision OCR
 │
 ▼
Structured JSON
 │
 ▼
MongoDB
 │
 ▼
Retriever
 │
 ▼
Vector Search
 │
 ▼
Government Rules
 │
 ▼
Gemini
 │
 ▼
AI Recommendation
 │
 ▼
Admin Dashboard
 │
 ▼
Approve / Reject
```

---

# 🛠 Tech Stack

## Frontend

- HTML
- CSS
- Bootstrap
- EJS

---

## Backend

- Node.js
- Express.js

---

## Database

- MongoDB
- Mongoose

---

## Authentication

- Passport.js
- Passport Local Mongoose
- Express Sessions

---

## File Upload

- Multer
- Cloudinary

---

## AI

- Google Gemini 2.5 Flash
- Gemini Vision OCR
- Gemini Embeddings

---

## RAG Pipeline

- Custom Chunking
- Vector Embeddings
- Cosine Similarity Search
- Local Vector Store
- Retrieval-Augmented Generation (RAG)

---

## APIs Used

- Google Gemini API
- Cloudinary API
- Mapbox API

---

# 📂 Project Structure

```text
WanderStay

├── controllers/
├── Models/
├── routes/
├── services/
│      ├── gemini.js
│      ├── chunker.js
│      ├── embeddings.js
│      ├── retriever.js
│      ├── vectorStore.js
│      └── rag.js
│
├── documents/
│      ├── government_rules.txt
│      ├── hotel_guidelines.txt
│      ├── fire_safety_rules.txt
│      └── license_requirements.txt
│
├── vectorDB/
│      └── embeddings.json
│
├── views/
├── public/
└── app.js
```

---

# 🧩 AI Verification Workflow

### Step 1

User uploads business license.

↓

### Step 2

License image stored securely on Cloudinary.

↓

### Step 3

Gemini Vision extracts structured information.

↓

### Step 4

Extracted data is stored in MongoDB.

↓

### Step 5

A semantic query is generated.

↓

### Step 6

Retriever performs vector similarity search.

↓

### Step 7

Relevant government rules are retrieved.

↓

### Step 8

Gemini analyzes the extracted license together with retrieved regulations.

↓

### Step 9

Admin receives:

- AI Recommendation
- Confidence Score
- Retrieved Rules
- Extracted License Details

↓

### Step 10

Admin approves or rejects the application.

---

# ✨ Future Enhancements

- QR Code Verification
- Fake Document Detection
- Government API Validation
- Multiple Document Verification
- Automatic License Renewal Alerts
- Explainable AI with Highlighted Evidence
- Multi-language Document Support

---

# 💻 Installation

```bash
git clone https://github.com/Preksha0401/WanderStay.git

cd WanderStay

npm install

npm start
```

---

## Environment Variables

Create a `.env` file.

```env
ATLASDB_URL=your_mongodb_url

SECRET=session_secret

CLOUD_NAME=your_cloudinary_name

CLOUD_API_KEY=your_cloudinary_api_key

CLOUD_API_SECRET=your_cloudinary_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

# 👩‍💻 Author

**Preksha Pravin Salvi**

B.Tech Computer Engineering

Sardar Patel Institute of Technology

GitHub:
https://github.com/Preksha0401

---

# ⭐ If you found this project interesting, consider giving it a Star!
