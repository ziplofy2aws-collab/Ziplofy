"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupportDeveloper = exports.getSupportDevelopers = void 0;
const supportdeveloper_model_1 = require("../models/supportdeveloper.model");
/**
 * @desc    Get all support developers
 * @route   GET /api/support-developer
 * @access  Private
 */
const getSupportDevelopers = async (req, res) => {
    try {
        const supportDevelopers = await supportdeveloper_model_1.SupportDeveloper.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            supportDevelopers,
            count: supportDevelopers.length,
        });
    }
    catch (err) {
        console.error("Error fetching support developers:", err);
        res.status(500).json({ error: "Server error while fetching support developers." });
    }
};
exports.getSupportDevelopers = getSupportDevelopers;
/**
 * @desc    Create a new support developer
 * @route   POST /api/support-developer
 * @access  Private
 */
const createSupportDeveloper = async (req, res) => {
    try {
        const { username, email } = req.body;
        // Basic validation
        if (!username || !email) {
            return res.status(400).json({ error: "Username and email are required." });
        }
        // Check if a support developer with the same email already exists
        const existingByEmail = await supportdeveloper_model_1.SupportDeveloper.findOne({ email: email.trim().toLowerCase() });
        if (existingByEmail) {
            return res.status(409).json({ error: "Email already exists." });
        }
        // Create new support developer
        const newSupportDeveloper = new supportdeveloper_model_1.SupportDeveloper({ username, email });
        await newSupportDeveloper.save();
        res.status(201).json({
            message: "Support developer created successfully.",
            supportDeveloper: newSupportDeveloper,
        });
    }
    catch (err) {
        // Handle duplicate key error
        if (err.code === 11000 && err.keyPattern) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
            });
        }
        res.status(500).json({ error: "Server error." });
    }
};
exports.createSupportDeveloper = createSupportDeveloper;
