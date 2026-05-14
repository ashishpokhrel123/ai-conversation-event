# 🚀 AI-First Conversational Event Platform

An enterprise-grade, monorepo-based platform that allows users to create, manage, and schedule events entirely through natural language conversations with an AI. 

Built with modern architectural patterns (Clean Modular Monolith, Strategy/Adapter Pattern) and a premium, dynamic frontend.

---

## 🏗️ Architecture

This repository is structured as an **NPM Workspace Monorepo**, ensuring unified versioning and seamless local development.

- **Frontend (`/frontend`)**: Next.js, React, Redux Toolkit, TailwindCSS.
- **Backend (`/backend`)**: NestJS, Prisma ORM, PostgreSQL.
- **AI Integration**: Implements the **Adapter Design Pattern** (`IAiAdapter`), allowing seamless swapping between Google Gemini, OpenAI, or Anthropic models without touching core business logic.

---

## ✨ Key Features

- **Conversational Event Creation**: Simply chat with the AI ("I want to host a tech meetup in SF next Friday") to generate structured event data.
- **Real-Time Data Parsing**: As you chat, the AI extracts metadata (Name, Location, Dates) and updates the database via partial JSON payloads.
- **Enterprise Security**: 
  - JWT-based authentication & authorization.
  - Global Input Validation Pipes.
  - Comprehensive Audit Logging (`AuditLog` table).
  - GDPR-compliant account deletion and explicit user consent flows.
- **Premium UI/UX**: Dark mode aesthetic, sleek typography, micro-animations, and a highly responsive Chat UI.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Running locally or via Docker)
- **AI API Key** (Currently configured for [Google Gemini](https://aistudio.google.com/))

### 2. Environment Variables
You need to set up environment files in both the frontend and backend directories.

**`backend/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_events?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-gemini-api-key"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL="http://localhost:3005"
```
*(Note: Ensure the API URL matches the port your NestJS backend is running on)*

### 3. Installation & Database Setup
From the **root directory**, run the following commands:
```bash
# 1. Install all dependencies across the monorepo
npm install

# 2. Push the Prisma schema to your PostgreSQL database
npm run prisma:migrate

# 3. Generate the Prisma Client
npm run prisma:generate
```

### 4. Running the Application
```bash
# Starts both the NestJS backend and Next.js frontend concurrently
npm run dev
```

---

## 🚀 Usage Guide
1. Open your browser to the local Next.js port (usually `http://localhost:3000` or `3001`).
2. **Sign Up**: Create an account via the secure authentication portal.
3. **Dashboard**: View your existing Draft, Scheduled, and Published events.
4. **Chat Interface**: Click **"New Event"** and start chatting! 
   - *Example: "Help me organize a React workshop next Saturday at 10 AM."*
5. Watch the AI seamlessly extract your intent and persist the data in real-time.

---

## 🔮 Scalability Roadmap
While this MVP is built on a rock-solid foundation, scaling to millions of concurrent users will involve transitioning to an event-driven architecture:
1. **Asynchronous Queues**: Implementing BullMQ/Redis to offload synchronous AI HTTP requests.
2. **WebSockets/SSE**: Streaming AI responses to the client instead of holding HTTP connections open.
3. **Database Pooling**: Adding PgBouncer to manage high-volume database connections.
