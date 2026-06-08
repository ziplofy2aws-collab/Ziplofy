"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferTimelineRouter = void 0;
const express_1 = require("express");
const transfer_timeline_controller_1 = require("../controllers/transfer-timeline.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.transferTimelineRouter = (0, express_1.Router)();
exports.transferTimelineRouter.use(auth_middleware_1.protect);
// Create timeline entry
exports.transferTimelineRouter.post('/', transfer_timeline_controller_1.createTransferTimeline);
// Get by transfer id
exports.transferTimelineRouter.get('/transfer/:transferId', transfer_timeline_controller_1.getTransferTimelineByTransferId);
// Update timeline entry
exports.transferTimelineRouter.put('/:id', transfer_timeline_controller_1.updateTransferTimeline);
// Delete timeline entry
exports.transferTimelineRouter.delete('/:id', transfer_timeline_controller_1.deleteTransferTimeline);
