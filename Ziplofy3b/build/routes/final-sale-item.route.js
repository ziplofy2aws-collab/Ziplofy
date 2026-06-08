"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const final_sale_item_controller_1 = require("../controllers/final-sale-item.controller");
const finalSaleItemRouter = (0, express_1.Router)();
// Create
finalSaleItemRouter.post('/', final_sale_item_controller_1.createFinalSaleItem);
// Delete by id
finalSaleItemRouter.delete('/:id', final_sale_item_controller_1.deleteFinalSaleItem);
// Get by returnRulesId
finalSaleItemRouter.get('/return-rules/:returnRulesId', final_sale_item_controller_1.getFinalSaleItemsByReturnRulesId);
exports.default = finalSaleItemRouter;
