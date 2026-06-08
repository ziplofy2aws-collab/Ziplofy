import { Router } from 'express';
import { forgotPassword, resetPassword, storefrontLogin, storefrontMe, storefrontSignup } from '../controllers/storefront-auth.controller';
import { storefrontProtect } from '../middlewares/storefront-auth.middleware';

export const storefrontAuthRouter = Router();

// Public storefront auth routes
storefrontAuthRouter.post('/signup', storefrontSignup);
storefrontAuthRouter.post('/login', storefrontLogin);
storefrontAuthRouter.get('/me', storefrontProtect, storefrontMe);
storefrontAuthRouter.post('/forgot-password', forgotPassword);
storefrontAuthRouter.post('/reset-password', resetPassword);


