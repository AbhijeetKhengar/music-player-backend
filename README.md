# music-player-backend

A RESTful backend API for a music player app. It supports user authentication, playlist management, and song management — with songs sourced from Spotify metadata.

---

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express v5
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Joi
- **Other:** bcrypt, cors, morgan, dotenv, nodemon

---

## Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/music-player
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

---

## Installation & Running

```bash
npm install
npm start
```

The server starts at `http://localhost:5000` (or the port set in `.env`).

---

## Project Structure

```
src/
├── config/         # MongoDB connection
├── constants/      # API paths, endpoints, status codes
├── controllers/    # Route handler logic
├── middlewares/    # Auth, validation, error handling
├── models/         # Mongoose schemas (User, Playlist, Song)
├── routes/         # Express routers
├── utils/          # Token helpers, response handler, pagination
├── validations/    # Joi schemas
├── app.js          # Express app setup
└── server.js       # Entry point
```

---

## API Reference

Base path: `/api`

### Auth — `/api/auth`

| Method | Endpoint    | Auth | Description       |
|--------|-------------|------|-------------------|
| POST   | `/register` | No   | Register new user |
| POST   | `/login`    | No   | Login, get token  |

**Register body:**
```json
{ "username": "john", "email": "john@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

---

### Users — `/api/users`

| Method | Endpoint | Auth | Description          |
|--------|----------|------|----------------------|
| GET    | `/`      | Yes  | Get logged-in user   |

---

### Playlists — `/api/playlists`

| Method | Endpoint | Auth | Description              |
|--------|----------|------|--------------------------|
| POST   | `/`      | Yes  | Create a playlist        |
| GET    | `/`      | Yes  | Get all user playlists   |
| GET    | `/:id`   | Yes  | Get playlist by ID       |
| PUT    | `/:id`   | Yes  | Update playlist          |
| DELETE | `/:id`   | Yes  | Delete playlist          |

---

### Songs — `/api/playlists/:playlistId/songs`

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/`                   | Yes  | Add song to playlist     |
| DELETE | `/:songId`            | Yes  | Remove song from playlist|

**Add song body:**
```json
{
  "spotifyId": "3n3Ppam7vgaVa1iaRUIOKE",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "albumArt": "https://...",
  "duration": 210000,
  "previewUrl": "https://..."
}
```

> Songs are stored using Spotify metadata. `spotifyId` must be unique across the database.

---

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are valid for **7 days**.

---

## Data Models

**User:** `username`, `email`, `password` (hashed), `playlists[]`

**Playlist:** `name`, `description`, `user` (ref), `songs[]` (refs)

**Song:** `spotifyId`, `title`, `artist`, `album`, `albumArt`, `duration`, `previewUrl`
