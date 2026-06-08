"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const state_controller_1 = require("../controllers/state.controller");
const stateRouter = (0, express_1.Router)();
stateRouter.get('/', state_controller_1.getAllStates);
stateRouter.get('/country/:countryId', state_controller_1.getStatesByCountryId);
stateRouter.get('/:id', state_controller_1.getStateById);
exports.default = stateRouter;
