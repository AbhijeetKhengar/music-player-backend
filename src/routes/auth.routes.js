import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { ENDPOINTS } from '../constants/api.js';

const router = express.Router();

router.post(ENDPOINTS.AUTH.REGISTER, validate(registerSchema), authController.register);
router.post(ENDPOINTS.AUTH.LOGIN, validate(loginSchema), authController.login);

export default router;
