"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEvent = void 0;
const event_types_1 = require("../../types/event.types");
const sendWelcomeEvent = (socket, socketUser) => {
    const welcomePayload = {
        message: socketUser.superAdmin ? `Welcome admin ${socketUser.name}` : `Welcome Client ${socketUser.name}`
    };
    socket.emit(event_types_1.SocketEventType.Welcome, welcomePayload);
};
exports.sendWelcomeEvent = sendWelcomeEvent;
