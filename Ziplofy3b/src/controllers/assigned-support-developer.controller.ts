import { NextFunction, Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";
import { AssignedSupportDevelopers } from "../models/assigned-support-developers.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { SupportDeveloper } from "../models/supportdeveloper.model";
import { io } from "../index";
import { userIdToSocketIdMap } from "../index";
import { SocketEventType } from "../types/event.types";
import { User } from "../models/user.model";

// Store socket connections by user ID
const userSockets = new Map<string, string>();

export const createAssignedSupportDeveloper = asyncErrorHandler(async (req: Request, res: Response,next: NextFunction) => {
  const { userId, supportDeveloperId } = req.body;

  // Check for duplicate assignment
  const existingAssignment = await AssignedSupportDevelopers.findOne({
    userId,
    supportDeveloperId,
  });

  if (existingAssignment) {
    return next(new CustomError("This user is already assigned to this support developer.", 400));
  }

  const assignment = await AssignedSupportDevelopers.create({
    userId,
    supportDeveloperId,
    adminId: req.user?.id,
  });

  // Fetch the support developer details by supportDeveloperId and select the username
  const supportDeveloper = await SupportDeveloper.findById(supportDeveloperId);
  if (!supportDeveloper) {
    return next(new CustomError("Support developer not found.", 404));
  }

  const userSocketId = userIdToSocketIdMap.get(userId);

  if(userSocketId) {

  io.to(userSocketId).emit(SocketEventType.DeveloperAssigned, {
    message: `${supportDeveloper.username} has been assigned to you`,
      developerName: supportDeveloper.username,
      developerEmail: supportDeveloper.email,
      developerId: supportDeveloperId
    });
  }

  // Populate the assignment with user details
  const populatedAssignment = await AssignedSupportDevelopers.findById(assignment._id)
    .populate("userId", "name email")
    .populate("supportDeveloperId", "username email")
    .populate("adminId", "name email");


  // After creating the assignment, update the User document to set assignedSupportDeveloperId
  await User.findByIdAndUpdate(
    userId,
    { assignedSupportDeveloperId: supportDeveloperId },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: populatedAssignment,
  });
});

export const getAssignedSupportDevelopers = asyncErrorHandler(async (req: Request, res: Response) => {
  const assignments = await AssignedSupportDevelopers.find()
    .populate("userId", "name email")
    .populate("supportDeveloperId", "username email")
    .populate("adminId", "name email");

  res.status(200).json({
    success: true,
    data: assignments,
  });
});

export const getAssignedSupportDeveloper = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const assignment = await AssignedSupportDevelopers.findById(id)
    .populate("userId", "name email")
    .populate("supportDeveloperId", "username email")
    .populate("adminId", "name email");

  if (!assignment) {
    throw new CustomError("Assignment not found", 404);
  }

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

export const updateAssignedSupportDeveloper = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, supportDeveloperId } = req.body;

  const assignment = await AssignedSupportDevelopers.findByIdAndUpdate(
    id,
    { userId, supportDeveloperId },
    { new: true, runValidators: true }
  )
    .populate("userId", "name email")
    .populate("supportDeveloperId", "username email")
    .populate("adminId", "name email");

  if (!assignment) {
    throw new CustomError("Assignment not found", 404);
  }

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

export const deleteAssignedSupportDeveloper = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const assignment = await AssignedSupportDevelopers.findByIdAndDelete(id);

  if (!assignment) {
    throw new CustomError("Assignment not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// Socket.IO notification function
export const notifyDeveloperAssigned = async (io: SocketIOServer, assignmentId: string) => {
  try {
    const populatedAssignment = await AssignedSupportDevelopers.findById(assignmentId)
      .populate("userId", "name email")
      .populate("supportDeveloperId", "username email")
      .populate("adminId", "name email");

    if (!populatedAssignment) return;

    // Get the socket ID for the client
    const userSocketId = userSockets.get((populatedAssignment.userId as any)._id.toString());
    
    if (userSocketId) {
      // User is online, send notification
      io.to(userSocketId).emit("developerAssigned", {
        type: "developerAssigned",
        message: `A developer has been assigned to you!`,
        assignment: {
          developer: {
            username: (populatedAssignment?.supportDeveloperId as any)?.username,
            email: (populatedAssignment?.supportDeveloperId as any)?.email,
          },
          assignedBy: {
            name: (populatedAssignment?.adminId as any)?.name,
            email: (populatedAssignment?.adminId as any)?.email,
          },
          assignedAt: populatedAssignment?.assignedAt,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Function to store user socket connection
export const storeUserSocket = (userId: string, socketId: string) => {
  userSockets.set(userId, socketId);
};

// Function to remove user socket connection
export const removeUserSocket = (socketId: string) => {
  for (const [userId, storedSocketId] of userSockets.entries()) {
    if (storedSocketId === socketId) {
      userSockets.delete(userId);
      break;
    }
  }
};