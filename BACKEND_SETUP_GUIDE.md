# Backend Setup Guide

A step-by-step guide to building a Node.js + Express + MongoDB REST API from scratch.
Uses the **music-player-backend** as a reference example throughout.

---

## Step 1 — Initialize the Project

```bash
mkdir my-backend
cd my-backend
npm init -y
```

Open `package.json` and add `"type": "module"` to enable ESM imports:

```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "nodemon src/server.js"
  }
}
```

---

## Step 2 — Install Dependencies

```bash
npm install express mongoose dotenv bcrypt jsonwebtoken joi cors morgan
npm install nodemon --save-dev
```

| Package       | Purpose                              |
|---------------|--------------------------------------|
| express       | HTTP framework                       |
| mongoose      | MongoDB ODM                          |
| dotenv        | Load environment variables from .env |
| bcrypt        | Hash passwords                       |
| jsonwebtoken  | Generate and verify JWT tokens       |
| joi           | Request body/params validation       |
| cors          | Enable cross-origin requests         |
| morgan        | HTTP request logger                  |
| nodemon       | Auto-restart server on file changes  |

---

## Step 3 — Create the Folder Structure

From the project root, run:

```bash
mkdir -p src/{config,constants,controllers,middlewares,models,routes,utils,validations}
```

This creates the following structure:

```
my-backend/
├── src/
│   ├── config/         # Database connection
│   ├── constants/      # API paths, status codes, enums
│   ├── controllers/    # Route handler logic (business logic)
│   ├── middlewares/    # Auth, validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── utils/          # Reusable helpers (token, response, pagination)
│   ├── validations/    # Joi validation schemas
│   ├── app.js          # Express app setup
│   └── server.js       # Entry point
├── .env
├── .gitignore
└── package.json
```

> Each folder has a single responsibility. This separation makes the codebase easy to scale and maintain.

---

## Step 4 — Create `.gitignore`

```bash
touch .gitignore
```

```
node_modules/
dist/
logs/
.env
package-lock.json
```

---

## Step 5 — Create `.env`

```bash
touch .env
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/my-backend
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
```

> Never commit `.env` to version control. Each secret should be a long random string in production.

---

Next steps will cover: constants → config → utils → models → validations → middlewares → controllers → routes → app.js → server.js

---

## Step 6 — Constants (`src/constants/api.js`)

This file centralizes all magic strings — route paths, endpoint segments, status codes, and validation types. Using constants avoids typos and makes refactoring easier.

```js
// src/constants/api.js

export const PATHS = {
  API: '/api',
  ROOT: '/',
  BY_ID: '/:id',
};

export const ENDPOINTS = {
  BASE: {
    AUTH: '/auth',
    USERS: '/users',
    PLAYLISTS: '/playlists',
    // add more resource base paths here
  },
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login',
  },
  // example for nested routes (e.g. songs inside playlists)
  PLAYLIST: {
    SONGS: '/:playlistId/songs',
    SONG_BY_ID: '/:playlistId/songs/:songId',
  },
};

export const VALIDATION_TYPE = {
  BODY: 'body',
  PARAMS: 'params',
  QUERY: 'query',
  HEADERS: 'headers',
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
```

> When adding a new resource (e.g. `albums`), just add its base path under `ENDPOINTS.BASE` and its sub-routes under a new key.

---

## Step 7 — Database Config (`src/config/db.js`)

Handles the MongoDB connection using Mongoose. Called once at server startup.

```js
// src/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};
```

> `MONGO_URI` is read from `.env`. For Atlas, replace the URI with your connection string from the Atlas dashboard.

---

## Step 8 — Utils

Utilities are small, reusable, stateless helpers used across the app.

### 8a. Response Handler (`src/utils/responseHandler.js`)

Standardizes every API response shape so all endpoints return the same structure.

```js
// src/utils/responseHandler.js

import { STATUS_CODES } from '../constants/api.js';

export const apiResponse = (res, success, message, data = null, statusCode = STATUS_CODES.OK) => {
  const response = {
    status: success ? 'success' : 'failure',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
```

Every response will look like:

```json
{
  "status": "success",
  "message": "Playlist created successfully!",
  "data": { ... }
}
```

---

### 8b. Token Helpers (`src/utils/token.js`)

Wraps JWT sign and verify so token logic stays out of controllers.

```js
// src/utils/token.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
```

> Change `expiresIn` to suit your needs — e.g. `'15m'` for access tokens and `'7d'` for refresh tokens in production.

---

### 8c. Pagination Helper (`src/utils/paginate.js`)

Applies `skip` and `limit` to any Mongoose query for paginated list endpoints.

```js
// src/utils/paginate.js

export const paginate = (query, { page = 1, limit = 10 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return query.skip(skip).limit(parseInt(limit));
};
```

Usage in a controller:

```js
const playlists = await paginate(Playlist.find({ user: req.userId }), req.query);
```

Pass `?page=2&limit=5` as query params to paginate any list endpoint.

---

Next steps will cover: models → validations → middlewares

---

## Step 9 — Models (`src/models/`)

Models define the shape of your data in MongoDB using Mongoose schemas. One file per resource.

### 9a. User Model (`src/models/user.model.js`)

```js
// src/models/user.model.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
```

### 9b. Playlist Model (`src/models/playlist.model.js`)

```js
// src/models/playlist.model.js

import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    songs:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model('Playlist', playlistSchema);
```

### 9c. Song Model (`src/models/song.model.js`)

```js
// src/models/song.model.js

import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    spotifyId:  { type: String, required: true, unique: true },
    title:      { type: String, required: true },
    artist:     { type: String, required: true },
    album:      { type: String },
    albumArt:   { type: String },
    duration:   { type: Number },
    previewUrl: { type: String },
    addedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Song = mongoose.model('Song', songSchema);
```

> Key Mongoose field options:
> - `required: true` — field must be present
> - `unique: true` — MongoDB creates a unique index on this field
> - `ref: 'ModelName'` — enables `.populate()` to join documents
> - `timestamps: true` — auto-adds `createdAt` and `updatedAt`

---

## Step 10 — Validations (`src/validations/`)

Validations use Joi to validate incoming request data before it reaches the controller. One file per resource.

### 10a. Auth Validation (`src/validations/auth.validation.js`)

```js
// src/validations/auth.validation.js

import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});
```

### 10b. Playlist Validation (`src/validations/playlist.validation.js`)

```js
// src/validations/playlist.validation.js

import Joi from 'joi';
import mongoose from 'mongoose';

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
  return value;
};

export const createPlaylistSchema = Joi.object({
  name:        Joi.string().required().trim().max(100),
  description: Joi.string().allow('').max(500),
});

export const updatePlaylistSchema = Joi.object({
  name:        Joi.string().trim().max(100),
  description: Joi.string().allow('').max(500),
});

export const playlistIdSchema = Joi.object({
  id: Joi.string().custom(validateObjectId, 'MongoDB ObjectId validation').required()
    .messages({ 'any.invalid': 'Invalid playlist ID format' }),
});
```

### 10c. Song Validation (`src/validations/song.validation.js`)

```js
// src/validations/song.validation.js

import Joi from 'joi';
import mongoose from 'mongoose';

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
  return value;
};

export const playlistIdParamSchema = Joi.object({
  playlistId: Joi.string().custom(validateObjectId).required()
    .messages({ 'any.invalid': 'Invalid playlist ID format' }),
});

export const songIdParamSchema = Joi.object({
  playlistId: Joi.string().custom(validateObjectId).required()
    .messages({ 'any.invalid': 'Invalid playlist ID format' }),
  songId: Joi.string().custom(validateObjectId).required()
    .messages({ 'any.invalid': 'Invalid song ID format' }),
});

export const addSongSchema = Joi.object({
  spotifyId:  Joi.string().required(),
  title:      Joi.string().required().trim().max(200),
  artist:     Joi.string().required().trim().max(200),
  album:      Joi.string().allow('').max(200),
  albumArt:   Joi.string().uri().allow(''),
  duration:   Joi.number().integer().min(0),
  previewUrl: Joi.string().uri().allow(''),
});
```

> When adding a new resource, create a new `<resource>.validation.js` file and define schemas for each operation (create, update, id param, etc.).

---

## Step 11 — Middlewares (`src/middlewares/`)

Middlewares run between the request and the controller. They handle cross-cutting concerns like auth, validation, and error handling.

### 11a. Validate Middleware (`src/middlewares/validate.js`)

Reusable middleware that runs any Joi schema against `req.body`, `req.params`, or `req.query`.

```js
// src/middlewares/validate.js

import { STATUS_CODES, VALIDATION_TYPE } from '../constants/api.js';
import { apiResponse } from '../utils/responseHandler.js';

export const validate = (schema, type = VALIDATION_TYPE.BODY) => (req, res, next) => {
  const { error } = schema.validate(req[type]);
  if (error)
    return apiResponse(res, false, 'Validation failed: ' + error.details[0].message, null, STATUS_CODES.BAD_REQUEST);
  next();
};
```

Usage on a route:

```js
// validate body (default)
router.post('/', validate(createPlaylistSchema), controller.create);

// validate route params
router.get('/:id', validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), controller.getById);
```

---

### 11b. Auth Middleware (`src/middlewares/authMiddleware.js`)

Protects routes by verifying the JWT from the `Authorization` header and attaching `userId` to the request.

```js
// src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
};
```

Usage on a route:

```js
router.get('/', authenticate, controller.getAll);
```

---

### 11c. Error Handler (`src/middlewares/errorHandler.js`)

Global error handler — must be registered last in `app.js`. Logs errors to a file and returns a clean JSON response.

```js
// src/middlewares/errorHandler.js

import fs from 'fs';
import path from 'path';

const logFilePath = path.join('logs', 'errors.log');

if (!fs.existsSync('logs')) fs.mkdirSync('logs');

const logErrorToFile = (error, req) => {
  const log = `
[${new Date().toISOString()}]
URL: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
Error: ${error.stack || error.message || error}
----------------------------------------------------
`;
  fs.appendFileSync(logFilePath, log);
};

export const errorHandler = (err, req, res, next) => {
  logErrorToFile(err, req);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
```

> Errors are written to `logs/errors.log`. The `logs/` folder is auto-created if it doesn't exist. Make sure `logs/` is in `.gitignore`.

---

Next steps will cover: controllers → routes → app.js → server.js

---

## Step 12 — Controllers (`src/controllers/`)

Controllers contain the actual business logic for each route. They receive the request, interact with the database via models, and send back a response using `apiResponse`. One file per resource.

### 12a. Auth Controller (`src/controllers/auth.controller.js`)

```js
// src/controllers/auth.controller.js

import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { generateAccessToken } from '../utils/token.js';
import { apiResponse } from '../utils/responseHandler.js';
import { STATUS_CODES } from '../constants/api.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return apiResponse(res, false, 'Email already registered', null, STATUS_CODES.CONFLICT);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = generateAccessToken(user._id);

    return apiResponse(res, true, 'User registered successfully',
      { token, user: { id: user._id, username, email } },
      STATUS_CODES.CREATED
    );
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return apiResponse(res, false, 'User not found', null, STATUS_CODES.NOT_FOUND);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return apiResponse(res, false, 'Invalid credentials', null, STATUS_CODES.UNAUTHORIZED);

    const token = generateAccessToken(user._id);

    return apiResponse(res, true, 'Login successful',
      { token, user: { id: user._id, username: user.username, email: user.email } }
    );
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
```

### 12b. User Controller (`src/controllers/user.controller.js`)

```js
// src/controllers/user.controller.js

import { User } from '../models/user.model.js';
import { apiResponse } from '../utils/responseHandler.js';
import { STATUS_CODES } from '../constants/api.js';

export const getById = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user)
      return apiResponse(res, false, 'User not found', null, STATUS_CODES.NOT_FOUND);

    return apiResponse(res, true, 'User retrieved successfully', user);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
```

> `.select('-password')` excludes the password field from the returned document.

### 12c. Playlist Controller (`src/controllers/playlist.controller.js`)

```js
// src/controllers/playlist.controller.js

import { Playlist } from '../models/playlist.model.js';
import { apiResponse } from '../utils/responseHandler.js';
import { STATUS_CODES } from '../constants/api.js';

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.create({ name, description, user: req.userId, songs: [] });
    return apiResponse(res, true, 'Playlist created successfully!', playlist, STATUS_CODES.CREATED);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.userId }).populate('songs');
    return apiResponse(res, true, 'Playlists retrieved successfully!', playlists);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.userId }).populate('songs');
    if (!playlist)
      return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);
    return apiResponse(res, true, 'Playlist retrieved successfully!', playlist);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, description },
      { new: true }
    );
    if (!playlist)
      return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);
    return apiResponse(res, true, 'Playlist updated successfully!', playlist);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!playlist)
      return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);
    return apiResponse(res, true, 'Playlist deleted successfully!', null);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
```

### 12d. Song Controller (`src/controllers/song.controller.js`)

```js
// src/controllers/song.controller.js

import { Playlist } from '../models/playlist.model.js';
import { Song } from '../models/song.model.js';
import { apiResponse } from '../utils/responseHandler.js';
import { STATUS_CODES } from '../constants/api.js';

export const addSongToPlaylist = async (req, res) => {
  try {
    const { spotifyId, title, artist, album, albumArt, duration, previewUrl } = req.body;

    const playlist = await Playlist.findOne({ _id: req.params.playlistId, user: req.userId });
    if (!playlist)
      return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);

    // reuse existing song or create new one
    let song = await Song.findOne({ spotifyId });
    if (!song)
      song = await Song.create({ spotifyId, title, artist, album, albumArt, duration, previewUrl });

    if (playlist.songs.includes(song._id))
      return apiResponse(res, false, 'Song already in playlist', null, STATUS_CODES.CONFLICT);

    playlist.songs.push(song._id);
    await playlist.save();

    return apiResponse(res, true, 'Song added to playlist!', playlist, STATUS_CODES.CREATED);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, user: req.userId });
    if (!playlist)
      return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);

    playlist.songs = playlist.songs.filter(id => id.toString() !== req.params.songId);
    await playlist.save();

    return apiResponse(res, true, 'Song removed from playlist!', playlist);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
```

> Controller pattern to follow for every resource:
> 1. Extract data from `req.body`, `req.params`, or `req.userId`
> 2. Query the database
> 3. Handle not found / conflict cases
> 4. Return `apiResponse`
> 5. Catch errors and return 500

---

## Step 13 — Routes (`src/routes/`)

Routes wire HTTP methods and paths to controllers, and apply middlewares in order. One file per resource, plus an `index.js` that mounts them all.

### 13a. Auth Routes (`src/routes/auth.routes.js`)

```js
// src/routes/auth.routes.js

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { ENDPOINTS } from '../constants/api.js';

const router = express.Router();

router.post(ENDPOINTS.AUTH.REGISTER, validate(registerSchema), authController.register);
router.post(ENDPOINTS.AUTH.LOGIN, validate(loginSchema), authController.login);

export default router;
```

### 13b. User Routes (`src/routes/user.routes.js`)

```js
// src/routes/user.routes.js

import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { PATHS } from '../constants/api.js';

const router = express.Router();

router.get(PATHS.ROOT, authenticate, userController.getById);

export default router;
```

### 13c. Playlist Routes (`src/routes/playlist.routes.js`)

```js
// src/routes/playlist.routes.js

import express from 'express';
import * as playlistController from '../controllers/playlist.controller.js';
import * as songController from '../controllers/song.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createPlaylistSchema, updatePlaylistSchema, playlistIdSchema } from '../validations/playlist.validation.js';
import { addSongSchema, playlistIdParamSchema, songIdParamSchema } from '../validations/song.validation.js';
import { ENDPOINTS, PATHS, VALIDATION_TYPE } from '../constants/api.js';

const router = express.Router();

// Playlist CRUD
router.post(PATHS.ROOT,   authenticate, validate(createPlaylistSchema), playlistController.createPlaylist);
router.get(PATHS.ROOT,    authenticate, playlistController.getUserPlaylists);
router.get(PATHS.BY_ID,   authenticate, validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), playlistController.getPlaylistById);
router.put(PATHS.BY_ID,   authenticate, validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), validate(updatePlaylistSchema), playlistController.updatePlaylist);
router.delete(PATHS.BY_ID, authenticate, validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), playlistController.deletePlaylist);

// Songs nested under playlists
router.post(ENDPOINTS.PLAYLIST.SONGS,      authenticate, validate(playlistIdParamSchema, VALIDATION_TYPE.PARAMS), validate(addSongSchema), songController.addSongToPlaylist);
router.delete(ENDPOINTS.PLAYLIST.SONG_BY_ID, authenticate, validate(songIdParamSchema, VALIDATION_TYPE.PARAMS), songController.removeSongFromPlaylist);

export default router;
```

### 13d. Root Router (`src/routes/index.js`)

Mounts all resource routers under their base paths.

```js
// src/routes/index.js

import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import playlistRoutes from './playlist.routes.js';
import { ENDPOINTS } from '../constants/api.js';

const router = express.Router();

router.use(ENDPOINTS.BASE.AUTH, authRoutes);
router.use(ENDPOINTS.BASE.USERS, userRoutes);
router.use(ENDPOINTS.BASE.PLAYLISTS, playlistRoutes);

export default router;
```

> When adding a new resource, create its route file and add one `router.use()` line here.

---

## Step 14 — App Setup (`src/app.js`)

Configures the Express app — registers global middlewares, mounts the router, and attaches the error handler last.

```js
// src/app.js

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import appRoutes from './routes/index.js';
import { PATHS } from './constants/api.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(PATHS.API, appRoutes);

app.use(errorHandler); // must be last

export default app;
```

> Middleware order matters:
> 1. `cors` — allow cross-origin requests
> 2. `express.json()` — parse JSON request bodies
> 3. `express.urlencoded()` — parse form data
> 4. `morgan` — log requests
> 5. Routes
> 6. `errorHandler` — always last, catches anything thrown in routes/controllers

---

## Step 15 — Entry Point (`src/server.js`)

Loads env, connects to MongoDB, then starts the HTTP server.

```js
// src/server.js

import app from './app.js';
import { connectMongo } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const startServer = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();
```

---

## Adding a New Resource — Checklist

When building any new resource (e.g. `albums`, `artists`, `orders`), follow this order:

```
1. [ ] Add base path to ENDPOINTS.BASE in constants/api.js
2. [ ] Create src/models/<resource>.model.js
3. [ ] Create src/validations/<resource>.validation.js
4. [ ] Create src/controllers/<resource>.controller.js
5. [ ] Create src/routes/<resource>.routes.js
6. [ ] Mount it in src/routes/index.js
```

No changes needed to `app.js`, `server.js`, `db.js`, or any middleware.

---

## Full Request Lifecycle

```
Client Request
    │
    ▼
app.js (cors → json → morgan)
    │
    ▼
routes/index.js  →  <resource>.routes.js
    │
    ▼
middlewares/authMiddleware.js  (if protected)
    │
    ▼
middlewares/validate.js  (Joi schema check)
    │
    ▼
controllers/<resource>.controller.js  (DB query + apiResponse)
    │
    ▼
middlewares/errorHandler.js  (if error thrown)
    │
    ▼
Client Response
```
