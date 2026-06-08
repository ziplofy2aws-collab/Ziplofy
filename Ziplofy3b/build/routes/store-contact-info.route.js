"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_contact_info_controller_1 = require("../controllers/store-contact-info.controller");
const storeContactInfoRouter = (0, express_1.Router)();
// Create (or upsert)
storeContactInfoRouter.post('/', store_contact_info_controller_1.createStoreContactInfo);
// Update by id
storeContactInfoRouter.put('/:id', store_contact_info_controller_1.updateStoreContactInfo);
// Get by store id
storeContactInfoRouter.get('/store/:storeId', store_contact_info_controller_1.getStoreContactInfoByStoreId);
exports.default = storeContactInfoRouter;
