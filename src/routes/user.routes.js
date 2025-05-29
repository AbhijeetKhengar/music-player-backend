import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { PATHS } from '../constants/api.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get(PATHS.ROOT, authenticate, userController.getById);

export default router;
