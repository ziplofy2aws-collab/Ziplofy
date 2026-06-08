"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const __1 = require("..");
const superadmin_notifications_model_1 = require("../models/superadmin-notifications.model");
const event_types_1 = require("../types/event.types");
const utils_1 = require("./utils");
let superAdminSocketId = null;
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        const socketUser = socket.user;
        (0, utils_1.sendWelcomeEvent)(socket, socketUser);
        if (socketUser.superAdmin)
            superAdminSocketId = socket.id;
        __1.userIdToSocketIdMap.set(socketUser.id, socket.id);
        socket.on(event_types_1.SocketEventType.HireDeveloper, async () => {
            // Check if a hire developer request already exists for this user
            const existingRequest = await superadmin_notifications_model_1.SuperAdminNotification.findOne({
                notificationType: "hireDeveloper",
                userId: socketUser.id
            });
            if (existingRequest) {
                socket.emit(event_types_1.SocketEventType.HireDeveloper, {
                    message: "You have already requested a support developer, please wait."
                });
                return;
            }
            const notification = await superadmin_notifications_model_1.SuperAdminNotification.create({
                notificationType: "hireDeveloper",
                userId: socketUser.id,
            });
            // Populate the notification with user data
            const populatedNotification = await superadmin_notifications_model_1.SuperAdminNotification.findById(notification._id)
                .populate('userId', 'name email')
                .lean();
            if (superAdminSocketId && populatedNotification) {
                const payload = {
                    message: `${socketUser.name} has requested to hire a developer`,
                    notification: populatedNotification
                };
                io.to(superAdminSocketId).emit(event_types_1.SocketEventType.HireDeveloper, payload);
            }
            socket.emit(event_types_1.SocketEventType.HireDeveloper, {
                message: "Your request has been sent to the developer!"
            });
        });
        socket.on(event_types_1.SocketEventType.EndMeeting, () => {
        });
        socket.on('disconnect', () => {
            console.log(`${socketUser.name} disconnected`);
        });
    });
}
