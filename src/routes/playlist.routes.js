import express from 'express';
import * as playlistController from '../controllers/playlist.controller.js';
import * as songController from '../controllers/song.controller.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createPlaylistSchema, playlistIdSchema, updatePlaylistSchema } from '../validations/playlist.validation.js';
import { addSongSchema, playlistIdParamSchema, songIdParamSchema } from '../validations/song.validation.js';
import { ENDPOINTS, PATHS, VALIDATION_TYPE } from '../constants/api.js';

const router = express.Router();

// Playlist CRUD
router.post(PATHS.ROOT, authenticate, validate(createPlaylistSchema), playlistController.createPlaylist);
router.get(PATHS.ROOT, authenticate, playlistController.getUserPlaylists);
router.get(PATHS.BY_ID, authenticate, validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), playlistController.getPlaylistById);
router.put(PATHS.BY_ID, authenticate, validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), validate(updatePlaylistSchema), playlistController.updatePlaylist);
router.delete(PATHS.BY_ID, authenticate, validate(playlistIdSchema, VALIDATION_TYPE.PARAMS), playlistController.deletePlaylist);

// Add/Remove Songs from Playlist
router.post(ENDPOINTS.PLAYLIST.SONGS, authenticate,  validate(playlistIdParamSchema, VALIDATION_TYPE.PARAMS), validate(addSongSchema), songController.addSongToPlaylist);
router.delete(ENDPOINTS.PLAYLIST.SONG_BY_ID, authenticate, validate(songIdParamSchema, VALIDATION_TYPE.PARAMS), songController.removeSongFromPlaylist);

export default router;
