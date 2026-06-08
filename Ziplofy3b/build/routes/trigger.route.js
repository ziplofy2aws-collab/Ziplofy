"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trigger_controller_1 = require("../controllers/trigger.controller");
const router = express_1.default.Router();
// GET /api/triggers
router.get('/', trigger_controller_1.getAllTriggers);
exports.default = router;
