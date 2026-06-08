"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreInvite = void 0;
// @ts-nocheck
const mongoose_1 = __importStar(require("mongoose"));
const storeInviteSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.default.Types.ObjectId, ref: 'Store', required: true },
    inviterId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true },
    inviterEmail: { type: String, required: true, trim: true },
    inviteeEmail: { type: String, required: true, trim: true, index: true },
    roleId: { type: mongoose_1.default.Types.ObjectId, ref: 'Role', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending',
    },
    token: { type: String, required: true, unique: true },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
}, { timestamps: true, versionKey: false });
storeInviteSchema.index({ storeId: 1, inviteeEmail: 1 }, { unique: false });
exports.StoreInvite = mongoose_1.default.model('StoreInvite', storeInviteSchema);
