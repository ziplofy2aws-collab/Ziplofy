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
exports.NotificationOption = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const customer_notifications_enum_1 = require("../../enums/customer-notifications.enum");
const staff_notifications_enum_1 = require("../../enums/staff-notifications.enum");
const fulfillment_notifications_enum_1 = require("../../enums/fulfillment-notifications.enum");
const notificationOptionSchema = new mongoose_1.Schema({
    notificationCategoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'NotificationCategory',
        required: [true, 'Notification category ID is required'],
        index: true,
    },
    optionName: {
        type: String,
        required: [true, 'Option name is required'],
        trim: true,
    },
    optionDesc: {
        type: String,
        trim: true,
        default: '',
    },
    toggle: {
        type: Boolean,
        default: false,
    },
    toggleValue: {
        type: String,
        trim: true,
        default: '',
    },
    emailSupported: {
        type: Boolean,
        default: false,
    },
    smsSupported: {
        type: Boolean,
        default: false,
    },
    segment: {
        type: String,
        trim: true,
        default: '',
    },
    emailBody: {
        type: String,
        default: '',
    },
    emailSubject: {
        type: String,
        trim: true,
        default: '',
    },
    smsData: {
        type: String,
        trim: true,
        default: '',
    },
    availableVariables: {
        type: [String],
        default: [],
    },
    key: {
        type: String,
        enum: [...Object.values(customer_notifications_enum_1.CustomerNotifications), ...Object.values(staff_notifications_enum_1.StaffNotifications), ...Object.values(fulfillment_notifications_enum_1.FulfillmentNotifications)],
        required: [true, 'Notification option key is required'],
    },
}, {
    timestamps: true,
    versionKey: false,
});
notificationOptionSchema.index({ notificationCategoryId: 1, optionName: 1 }, { unique: true });
exports.NotificationOption = mongoose_1.default.model('NotificationOption', notificationOptionSchema);
