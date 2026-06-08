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
exports.StoreNotificationOverride = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const customer_notifications_enum_1 = require("../../enums/customer-notifications.enum");
const staff_notifications_enum_1 = require("../../enums/staff-notifications.enum");
const fulfillment_notifications_enum_1 = require("../../enums/fulfillment-notifications.enum");
const storeNotificationOverrideSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store ID is required'],
        index: true,
    },
    notificationKey: {
        type: String,
        required: [true, 'Notification key is required'],
        enum: [
            ...Object.values(customer_notifications_enum_1.CustomerNotifications),
            ...Object.values(staff_notifications_enum_1.StaffNotifications),
            ...Object.values(fulfillment_notifications_enum_1.FulfillmentNotifications),
        ],
    },
    notificationOptionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'NotificationOption',
        required: [true, 'Notification option ID is required'],
        index: true,
    },
    emailSubject: {
        type: String,
        trim: true,
    },
    emailBody: {
        type: String,
    },
    smsData: {
        type: String,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
storeNotificationOverrideSchema.index({ storeId: 1, notificationKey: 1 }, { unique: true, name: 'store_notification_key_unique' });
storeNotificationOverrideSchema.index({ storeId: 1, notificationOptionId: 1 }, { unique: true, name: 'store_notification_option_unique' });
exports.StoreNotificationOverride = mongoose_1.default.model('StoreNotificationOverride', storeNotificationOverrideSchema);
