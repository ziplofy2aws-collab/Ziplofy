import { Request, Response } from "express";
import { SuperAdminNotification } from "../models/superadmin-notifications.model";
import { asyncErrorHandler } from "../utils/error.utils";

export const getSuperAdminNotifications = asyncErrorHandler(async (req: Request, res: Response) => {
  const notifications = await SuperAdminNotification.find({})
    .sort({ createdAt: -1 })
    .populate({
      path: "userId",
      select: "email name",
    });

  res.status(200).json({notifications});
});
