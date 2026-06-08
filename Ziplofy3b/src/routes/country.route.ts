import { Router } from 'express';
import { getAllCountries } from '../controllers/country.controller';

const countryRouter = Router();

countryRouter.get('/', getAllCountries);

export default countryRouter;


