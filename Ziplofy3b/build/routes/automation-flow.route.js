"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const automation_flow_controller_1 = require("../controllers/automation-flow.controller");
const router = express_1.default.Router();
// GET /api/automation-flows/:storeId
router.get('/:storeId', automation_flow_controller_1.getAutomationFlowsByStoreId);
// POST /api/automation-flows
router.post('/', automation_flow_controller_1.createAutomationFlow);
// PUT /api/automation-flows/:automationFlowId
router.put('/:automationFlowId', automation_flow_controller_1.updateAutomationFlow);
exports.default = router;
