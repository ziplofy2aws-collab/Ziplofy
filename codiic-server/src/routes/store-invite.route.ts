import { Router } from 'express';
import { createStoreInvite, listStoreUsers } from '../controllers/store-invite.controller';
import { protect } from '../middlewares/auth.middleware';

const storeInviteRouter = Router();

storeInviteRouter.use(protect);
storeInviteRouter.get('/', listStoreUsers);
storeInviteRouter.post('/', createStoreInvite);

export default storeInviteRouter;
