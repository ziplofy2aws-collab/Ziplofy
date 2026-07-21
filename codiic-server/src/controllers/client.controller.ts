import { Request, Response } from "express";
import { Client } from "../models/client.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

interface GetClientsQuery {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export const getClients = asyncErrorHandler(async (req: Request, res: Response) => {
  const { search, status, page = "1", limit = "10" } = req.query as GetClientsQuery;

  // Build filter object - only get clients for logged in user
  const filter: any = { user: req.user?.id };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All") {
    filter.status = status;
  }

  // Execute query with pagination
  const clients = await Client.find(filter)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ createdAt: -1 });

  // Get total documents count
  const count = await Client.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: clients,
    totalPages: Math.ceil(count / parseInt(limit)),
    currentPage: parseInt(page),
    total: count,
  });
});

interface GetClientParams {
  id: string;
}

export const getClient = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as GetClientParams;

  const client = await Client.findOne({
    _id: id,
    user: req.user?.id,
  });

  if (!client) {
    throw new CustomError("Client not found", 404);
  }

  res.status(200).json({
    success: true,
    data: client,
  });
});

interface CreateClientBody {
  name: string;
  email: string;
  totalPurchases?: number;
  status?: "Active" | "Inactive" | "Pending";
}

export const createClient = asyncErrorHandler(async (req: Request, res: Response) => {
  const { name, email, totalPurchases, status } = req.body as CreateClientBody;

  // Add user to client data
  const clientData = {
    name,
    email,
    totalPurchases: totalPurchases || 0,
    status: status || "Active",
    user: req.user?.id,
  };

  const client = await Client.create(clientData);

  res.status(201).json({
    success: true,
    data: client,
  });
});

interface UpdateClientParams {
  id: string;
}

interface UpdateClientBody {
  name?: string;
  email?: string;
  totalPurchases?: number;
  status?: "Active" | "Inactive" | "Pending";
}

export const updateClient = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UpdateClientParams;
  const updateData = req.body as UpdateClientBody;

  let client = await Client.findOne({
    _id: id,
    user: req.user?.id,
  });

  if (!client) {
    throw new CustomError("Client not found", 404);
  }

  client = await Client.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: client,
  });
});

interface DeleteClientParams {
  id: string;
}

export const deleteClient = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as DeleteClientParams;

  const client = await Client.findOne({
    _id: id,
    user: req.user?.id,
  });

  if (!client) {
    throw new CustomError("Client not found", 404);
  }

  await Client.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
