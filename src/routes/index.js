import express from 'express';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';
import playlistRoutes from './playlist.routes.js';
import { ENDPOINTS } from '../constants/api.js';

const router = express.Router();

router.use(ENDPOINTS.BASE.AUTH, authRoutes);
router.use(ENDPOINTS.BASE.USERS, userRoutes);
router.use(ENDPOINTS.BASE.PLAYLISTS, playlistRoutes);

export default router;
