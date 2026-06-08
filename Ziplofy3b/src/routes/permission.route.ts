import { Router } from 'express';
import { getAllPermissions } from '../controllers/permission.controller';

const permissionRouter = Router();

permissionRouter.get('/', getAllPermissions);

export default permissionRouter;


