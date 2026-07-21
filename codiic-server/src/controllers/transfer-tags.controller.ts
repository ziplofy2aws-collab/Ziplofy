import { Request, Response } from "express";
import mongoose from "mongoose";
import { TransferTagModel } from "../models/transfer-tags/tranfer-tags.model";
import { asyncErrorHandler } from "../utils/error.utils";

export const createTransferTag = asyncErrorHandler(async (req: Request, res: Response) => {
    const { storeId, name } = req.body as { storeId?: string; name?: string };
    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      return res.status(400).json({ success: false, message: "Valid storeId is required" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Tag name is required" });
    }
    const tag = await TransferTagModel.create({ storeId, name: name.trim() });
    return res.status(201).json({ success: true, data: tag });
});

export const getTransferTagsByStore = asyncErrorHandler(async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId: string };
    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      return res.status(400).json({ success: false, message: "Valid storeId is required" });
    }
    const tags = await TransferTagModel.find({ storeId }).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: tags, count: tags.length });
});

export const deleteTransferTag = asyncErrorHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Valid tag id is required" });
    }
    const deleted = await TransferTagModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }
    return res.status(200).json({ success: true, message: "Tag deleted", data: {deletedTag: deleted}});
});


