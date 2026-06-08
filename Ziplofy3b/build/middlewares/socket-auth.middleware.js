"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../constants");
const user_model_1 = require("../models/user.model");
const socketAuthMiddleware = async (socket, next) => {
    const token = socket.handshake.headers.token;
    if (!token)
        return next(new Error("Token missing, please login again"));
    if (token === constants_1.SUPER_ADMIN_TOKEN) {
        socket.user = {
            id: new mongoose_1.default.Types.ObjectId().toString(),
            name: "Super Admin",
            email: "superadmin@gmail.com",
            role: "super-admin",
            assignedSupportDeveloperId: '',
            accessToken: token,
            superAdmin: true
        };
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded.uid)
            return next(new Error("Invalid token, please login again"));
        const user = await user_model_1.User.findById(decoded.uid);
        if (!user)
            return next(new Error("Invalid token, please login again"));
        socket.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role.toString(),
            assignedSupportDeveloperId: user.assignedSupportDeveloperId?.toString() || '',
            accessToken: token,
            superAdmin: false
        };
        next();
    }
    catch (err) {
        console.error(`Socket ${socket.id}: Authentication error:`, err);
        next(new Error("Authentication failed"));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
