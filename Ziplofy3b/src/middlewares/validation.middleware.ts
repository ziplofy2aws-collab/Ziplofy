import { NextFunction, Request, Response } from "express";

export const validateClient = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({
      success: false,
      message: "Client name is required",
    });
    return;
  }

  if (!email || typeof email !== "string" || email.trim() === "") {
    res.status(400).json({
      success: false,
      message: "Email is required",
    });
    return;
  }

  // Basic email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
    return;
  }

  next();
};