import express from 'express';
import { googleAuth, login, me, register } from '../controllers/auth.controller';
import { protect } from '../middleware/auth-middleware';

export const authRouter = express.Router();


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/google',googleAuth);
authRouter.get('/me',protect,me);