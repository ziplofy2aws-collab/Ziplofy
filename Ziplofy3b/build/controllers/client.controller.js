"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClient = exports.getClients = void 0;
const client_model_1 = require("../models/client.model");
const error_utils_1 = require("../utils/error.utils");
exports.getClients = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { search, status, page = "1", limit = "10" } = req.query;
    // Build filter object - only get clients for logged in user
    const filter = { user: req.user?.id };
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
    const clients = await client_model_1.Client.find(filter)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .sort({ createdAt: -1 });
    // Get total documents count
    const count = await client_model_1.Client.countDocuments(filter);
    res.status(200).json({
        success: true,
        data: clients,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        total: count,
    });
});
exports.getClient = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const client = await client_model_1.Client.findOne({
        _id: id,
        user: req.user?.id,
    });
    if (!client) {
        throw new error_utils_1.CustomError("Client not found", 404);
    }
    res.status(200).json({
        success: true,
        data: client,
    });
});
exports.createClient = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { name, email, totalPurchases, status } = req.body;
    // Add user to client data
    const clientData = {
        name,
        email,
        totalPurchases: totalPurchases || 0,
        status: status || "Active",
        user: req.user?.id,
    };
    const client = await client_model_1.Client.create(clientData);
    res.status(201).json({
        success: true,
        data: client,
    });
});
exports.updateClient = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    let client = await client_model_1.Client.findOne({
        _id: id,
        user: req.user?.id,
    });
    if (!client) {
        throw new error_utils_1.CustomError("Client not found", 404);
    }
    client = await client_model_1.Client.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: client,
    });
});
exports.deleteClient = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const client = await client_model_1.Client.findOne({
        _id: id,
        user: req.user?.id,
    });
    if (!client) {
        throw new error_utils_1.CustomError("Client not found", 404);
    }
    await client_model_1.Client.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        data: {},
    });
});
