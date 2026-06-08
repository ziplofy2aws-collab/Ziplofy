import { NextFunction, Request, Response } from "express";
import { IRequirementsForm, RequirementsForm } from "../models/requirements-form.model";

import { User } from "../models/user.model";
import { sendEmail, UrlType } from "../utils/email.utils";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { config } from "../config";

export const createRequirementsForm = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { clientId, supportDeveloperId, requirements } = req.body as Pick<IRequirementsForm, "clientId" | "supportDeveloperId" | "requirements">;

  const requirementsForm = new RequirementsForm({
    clientId,
    supportDeveloperId,
    requirements,
    status:"Initiated"
  });

  await requirementsForm.save();

  // Fetch the user with the help of clientId
  const user = await User.findById(clientId).select("email");
  if (!user) {
    return next(new CustomError("User not found.", 404));
  }

  // Send email asynchronously (non-blocking)
  sendEmail({
    to: user.email,
    subject: "Action: Check Requirements form send by support developer",
    body: "A new requirements form has been created.",
    url: `${config.clientUrl}/requirements-form/${requirementsForm._id}`,
    urlType: UrlType.VIEW_REQUIREMENTS_FORM,
  });

  res.status(201).json({
    success: true,
    data: requirementsForm,
    message: "Requirements form created successfully.",
  });
});

export const updateRequirementsForm = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { requirements } = req.body as Pick<IRequirementsForm, "requirements">;

  console.log(requirements)

  // Validate input
  if (!Array.isArray(requirements) || requirements.length === 0) {
    return next(new CustomError("At least one requirement is required to update.", 400));
  }

  // Find and update the requirements form
  const updatedForm = await RequirementsForm.findByIdAndUpdate(
    id,
    { requirements },
    { new: true }
  );

  if (!updatedForm) {
    return next(new CustomError("Requirements form not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: updatedForm,
    message: "Requirements form updated successfully.",
  });
});

export const updateRequirementsFormStatus = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body as Pick<IRequirementsForm, "status">;

  if (!status) {
    return next(new CustomError("Invalid status. Status must be one of: Initiated, Accepted, Declined.", 400));
  }

  // Find and update the requirements form status
  const updatedForm = await RequirementsForm.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updatedForm) {
    return next(new CustomError("Requirements form not found.", 404));
  }
  
  res.status(200).json({
    success: true,
    data: updatedForm,
    message: "Requirements form status updated successfully.",
  });
});

export const getRequirementsForm = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const form = await RequirementsForm.findById(id);

  if (!form) {
    return res.status(404).json({
      success: false,
      message: "Requirements form not found.",
    });
  }

  res.status(200).json({
    success: true,
    data: form,
    message: "Requirements form fetched successfully.",
  });
});




