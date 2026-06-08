"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailWorker = startEmailWorker;
// Redis/BullMQ temporarily disabled for local development.
function startEmailWorker() {
    return {
        async close() {
            // no-op while Redis is disabled
        },
    };
}
