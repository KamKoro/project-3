B-Side Music App – Backend

This repository contains the backend for B-Side Music, a MERN application that allows users to browse a music catalogue, create playlists, and manage their personal library.

For screenshots, full app description, setup instructions, and future plans, please see the Frontend Repository (https://github.com/KamKoro/project-3/tree/main/frontend)


Tech Stack:
Node.js
Express
MongoDB + Mongoose
JWT Authentication

Local Development
1. Clone the repo
git clone https://github.com/KamKoro/project-3/tree/main/backend
cd backend

2. Install dependencies
npm install

3. Environment variables

Create a .env file with:

MONGODB_URI
SECRET=your_jwt_secret
PORT=3000

4. Seed the database (optional)
node seeds/seedCatalogSongs.js

5. Run the server
npm run dev


Server runs at:
http://localhost:3000

API Routes
Auth

POST /auth/sign-up – Register user

POST /auth/sign-in – Login user and return JWT

Playlists

GET /playlists – User’s playlists

POST /playlists – Create playlist

GET /playlists/:id – Single playlist

PUT /playlists/:id – Update playlist

DELETE /playlists/:id – Delete playlist

POST /playlists/:id/songs – Add song

DELETE /playlists/:id/songs/:songId – Remove song

Songs

GET /songs – Get songs (supports search query)

GET /songs/:id – Single song