import { Router } from 'express';
import { createCollectionEntry, deleteCollectionEntry, getCollectionEntriesByCollectionId } from '../controllers/collection-entry.controller';
import { protect } from '../middlewares/auth.middleware';

export const collectionEntryRouter = Router();
collectionEntryRouter.use(protect);

collectionEntryRouter.post('/', createCollectionEntry);
collectionEntryRouter.get('/collection/:id', getCollectionEntriesByCollectionId);
collectionEntryRouter.delete('/:id', deleteCollectionEntry);


