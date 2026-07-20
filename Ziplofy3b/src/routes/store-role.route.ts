import { Router } from 'express';
import { createRole, deleteRole, getRolesByStoreId, updateRole } from '../controllers/store-role.controller';
import { protect } from '../middlewares/auth.middleware';

const storeRoleRouter = Router();

storeRoleRouter.use(protect);

storeRoleRouter.get('/', getRolesByStoreId);
storeRoleRouter.post('/', createRole);
storeRoleRouter.patch('/:roleId', updateRole);
storeRoleRouter.delete('/:roleId', deleteRole);

export default storeRoleRouter;
