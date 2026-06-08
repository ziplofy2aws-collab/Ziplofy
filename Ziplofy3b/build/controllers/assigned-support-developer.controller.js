"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserSocket = exports.storeUserSocket = exports.notifyDeveloperAssigned = exports.deleteAssignedSupportDeveloper = exports.updateAssignedSupportDeveloper = exports.getAssignedSupportDeveloper = exports.getAssignedSupportDevelopers = exports.createAssignedSupportDeveloper = void 0;
const assigned_support_developers_model_1 = require("../models/assigned-support-developers.model");
const error_utils_1 = require("../utils/error.utils");
const supportdeveloper_model_1 = require("../models/supportdeveloper.model");
const index_1 = require("../index");
const index_2 = require("../index");
const event_types_1 = require("../types/event.types");
const user_model_1 = require("../models/user.model");
// Store socket connections by user ID
const userSockets = new Map();
exports.createAssignedSupportDeveloper = (0, error_utils_1.asyncErrorHandler)(async (req, res, next) => {
    const { userId, supportDeveloperId } = req.body;
    // Check for duplicate assignment
    const existingAssignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.findOne({
        userId,
        supportDeveloperId,
    });
    if (existingAssignment) {
        return next(new error_utils_1.CustomError("This user is already assigned to this support developer.", 400));
    }
    const assignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.create({
        userId,
        supportDeveloperId,
        adminId: req.user?.id,
    });
    // Fetch the support developer details by supportDeveloperId and select the username
    const supportDeveloper = await supportdeveloper_model_1.SupportDeveloper.findById(supportDeveloperId);
    if (!supportDeveloper) {
        return next(new error_utils_1.CustomError("Support developer not found.", 404));
    }
    const userSocketId = index_2.userIdToSocketIdMap.get(userId);
    if (userSocketId) {
        index_1.io.to(userSocketId).emit(event_types_1.SocketEventType.DeveloperAssigned, {
            message: `${supportDeveloper.username} has been assigned to you`,
            developerName: supportDeveloper.username,
            developerEmail: supportDeveloper.email,
            developerId: supportDeveloperId
        });
    }
    // Populate the assignment with user details
    const populatedAssignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.findById(assignment._id)
        .populate("userId", "name email")
        .populate("supportDeveloperId", "username email")
        .populate("adminId", "name email");
    // After creating the assignment, update the User document to set assignedSupportDeveloperId
    await user_model_1.User.findByIdAndUpdate(userId, { assignedSupportDeveloperId: supportDeveloperId }, { new: true });
    res.status(201).json({
        success: true,
        data: populatedAssignment,
    });
});
exports.getAssignedSupportDevelopers = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const assignments = await assigned_support_developers_model_1.AssignedSupportDevelopers.find()
        .populate("userId", "name email")
        .populate("supportDeveloperId", "username email")
        .populate("adminId", "name email");
    res.status(200).json({
        success: true,
        data: assignments,
    });
});
exports.getAssignedSupportDeveloper = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const assignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.findById(id)
        .populate("userId", "name email")
        .populate("supportDeveloperId", "username email")
        .populate("adminId", "name email");
    if (!assignment) {
        throw new error_utils_1.CustomError("Assignment not found", 404);
    }
    res.status(200).json({
        success: true,
        data: assignment,
    });
});
exports.updateAssignedSupportDeveloper = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { userId, supportDeveloperId } = req.body;
    const assignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.findByIdAndUpdate(id, { userId, supportDeveloperId }, { new: true, runValidators: true })
        .populate("userId", "name email")
        .populate("supportDeveloperId", "username email")
        .populate("adminId", "name email");
    if (!assignment) {
        throw new error_utils_1.CustomError("Assignment not found", 404);
    }
    res.status(200).json({
        success: true,
        data: assignment,
    });
});
exports.deleteAssignedSupportDeveloper = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const assignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.findByIdAndDelete(id);
    if (!assignment) {
        throw new error_utils_1.CustomError("Assignment not found", 404);
    }
    res.status(200).json({
        success: true,
        data: {},
    });
});
// Socket.IO notification function
const notifyDeveloperAssigned = async (io, assignmentId) => {
    try {
        const populatedAssignment = await assigned_support_developers_model_1.AssignedSupportDevelopers.findById(assignmentId)
            .populate("userId", "name email")
            .populate("supportDeveloperId", "username email")
            .populate("adminId", "name email");
        if (!populatedAssignment)
            return;
        // Get the socket ID for the client
        const userSocketId = userSockets.get(populatedAssignment.userId._id.toString());
        if (userSocketId) {
            // User is online, send notification
            io.to(userSocketId).emit("developerAssigned", {
                type: "developerAssigned",
                message: `A developer has been assigned to you!`,
                assignment: {
                    developer: {
                        username: populatedAssignment?.supportDeveloperId?.username,
                        email: populatedAssignment?.supportDeveloperId?.email,
                    },
                    assignedBy: {
                        name: populatedAssignment?.adminId?.name,
                        email: populatedAssignment?.adminId?.email,
                    },
                    assignedAt: populatedAssignment?.assignedAt,
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    catch (error) {
        console.error("Error sending notification:", error);
    }
};
exports.notifyDeveloperAssigned = notifyDeveloperAssigned;
// Function to store user socket connection
const storeUserSocket = (userId, socketId) => {
    userSockets.set(userId, socketId);
};
exports.storeUserSocket = storeUserSocket;
// Function to remove user socket connection
const removeUserSocket = (socketId) => {
    for (const [userId, storedSocketId] of userSockets.entries()) {
        if (storedSocketId === socketId) {
            userSockets.delete(userId);
            break;
        }
    }
};
exports.removeUserSocket = removeUserSocket;
