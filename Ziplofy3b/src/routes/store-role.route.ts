import { Router } from 'express';
import { createRole, deleteRole, getRolesByStoreId, updateRole } from '../controllers/store-role.controller';

const storeRoleRouter = Router();

// CRUD
storeRoleRouter.get('/', getRolesByStoreId); // /api/store-roles?storeId=...
storeRoleRouter.post('/', createRole);
storeRoleRouter.patch('/:roleId', updateRole);
storeRoleRouter.delete('/:roleId', deleteRole);

export default storeRoleRouter;


