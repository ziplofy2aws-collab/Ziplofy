import { Router } from 'express';
import { getAllStates, getStatesByCountryId, getStateById } from '../controllers/state.controller';

const stateRouter = Router();

stateRouter.get('/', getAllStates);
stateRouter.get('/country/:countryId', getStatesByCountryId);
stateRouter.get('/:id', getStateById);

export default stateRouter;

