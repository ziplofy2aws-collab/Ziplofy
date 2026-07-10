import { Router } from 'express';
import { getAllPermissions } from '../controllers/permission.controller';
import { protect } from '../middlewares/auth.middleware';

const permissionRouter = Router();

permissionRouter.use(protect);
permissionRouter.get('/', getAllPermissions);

export default permissionRouter;
