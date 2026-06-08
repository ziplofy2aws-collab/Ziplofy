"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const return_rules_controller_1 = require("../controllers/return-rules.controller");
const returnRulesRouter = (0, express_1.Router)();
// POST /api/return-rules
returnRulesRouter.post('/', return_rules_controller_1.createReturnRules);
// PUT /api/return-rules/:id
returnRulesRouter.put('/:id', return_rules_controller_1.updateReturnRules);
// GET /api/return-rules/store/:storeId
returnRulesRouter.get('/store/:storeId', return_rules_controller_1.getReturnRulesByStoreId);
exports.default = returnRulesRouter;
