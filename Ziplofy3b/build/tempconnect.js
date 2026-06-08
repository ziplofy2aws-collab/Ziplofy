"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    try {
        const conn = await mongoose_1.default.connect("mongodb://ziplofy2aws_db_user:UoErd1Bx9RWx5Bk0@cluster0.j17djyj.mongodb.net/test");
        console.log('Connected to database', conn.connection.host);
    }
    catch (error) {
        console.error('Database connection error:', error);
    }
};
connectDb();
