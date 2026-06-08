"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const action_controller_1 = require("../controllers/action.controller");
const router = express_1.default.Router();
// GET /api/actions
router.get('/', action_controller_1.getAllActions);
exports.default = router;
