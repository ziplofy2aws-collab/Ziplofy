"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientUserStats = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const store_model_1 = require("../models/store/store.model");
const user_model_1 = require("../models/user.model");
const error_utils_1 = require("../utils/error.utils");
/**
 * Get client user details and aggregate stats (orders, products sold).
 * Super-admin or support-admin only.
 */
exports.getClientUserStats = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { userId } = req.params;
    const userRole = req.user?.role;
    const isSuperAdmin = req.user?.superAdmin;
    const isSupportAdmin = userRole?.toLowerCase() === "support-admin";
    if (!isSuperAdmin && !isSupportAdmin) {
        throw new error_utils_1.CustomError("Only super-admin or support-admin can view client user stats", 403);
    }
    if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new error_utils_1.CustomError("Valid user ID is required", 400);
    }
    const user = await user_model_1.User.findById(userId)
        .select("-password")
        .populate("role", "name")
        .populate("assignedSupportDeveloperId", "username email")
        .lean();
    if (!user) {
        throw new error_utils_1.CustomError("User not found", 404);
    }
    const role = user.role;
    const roleName = (role?.name ?? "") || "";
    const assignedDev = user.assignedSupportDeveloperId;
    const adminRoles = ["super-admin", "support-admin", "client-admin", "developer-admin"];
    if (adminRoles.includes(roleName.toLowerCase())) {
        throw new error_utils_1.CustomError("This user is an admin, not a client user", 400);
    }
    const stores = await store_model_1.Store.find({ userId: new mongoose_1.Types.ObjectId(userId) }).lean();
    const storeIds = stores.map((s) => s._id);
    if (storeIds.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: roleName,
                    status: user.status,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    lastLogin: user.lastLogin,
                    assignedSupportDeveloper: assignedDev
                        ? { username: assignedDev.username || "", email: assignedDev.email || "" }
                        : null,
                },
                stores: [],
                totals: { storesCount: 0, ordersCount: 0, productsSold: 0, totalRevenue: 0 },
                ordersByMonth: [],
                ordersByMonthByStore: [],
                productsByStore: [],
                revenueByStore: [],
            },
        });
    }
    const orders = await models_1.Order.find({ storeId: { $in: storeIds } })
        .select("storeId orderDate total status")
        .lean();
    const orderIds = orders.map((o) => o._id);
    const orderItems = await models_1.OrderItem.find({ orderId: { $in: orderIds } })
        .select("orderId quantity total")
        .lean();
    const orderIdToStoreId = new Map(orders.map((o) => [o._id.toString(), o.storeId.toString()]));
    const productsByStoreMap = new Map();
    const revenueByStoreMap = new Map();
    const ordersByStoreMap = new Map();
    for (const item of orderItems) {
        const storeId = orderIdToStoreId.get(item.orderId.toString());
        if (!storeId)
            continue;
        const qty = productsByStoreMap.get(storeId) || 0;
        productsByStoreMap.set(storeId, qty + (item.quantity || 0));
    }
    for (const order of orders) {
        const storeId = order.storeId.toString();
        const rev = revenueByStoreMap.get(storeId) || 0;
        revenueByStoreMap.set(storeId, rev + (order.total || 0));
        const ordCount = ordersByStoreMap.get(storeId) || 0;
        ordersByStoreMap.set(storeId, ordCount + 1);
    }
    const storeIdToName = new Map(stores.map((s) => [s._id.toString(), s.storeName]));
    const storeIdToCode = new Map(stores.map((s) => [s._id.toString(), s.storeCode]));
    const getStoreDisplay = (id) => {
        const name = storeIdToName.get(id.toString()) || "Unknown";
        const code = storeIdToCode.get(id.toString());
        return code ? `${name} ${code}/${id}` : name;
    };
    const productsByStore = storeIds.map((id) => ({
        storeId: id,
        storeName: getStoreDisplay(id),
        productsSold: productsByStoreMap.get(id.toString()) || 0,
    }));
    const revenueByStore = storeIds.map((id) => ({
        storeId: id,
        storeName: getStoreDisplay(id),
        revenue: revenueByStoreMap.get(id.toString()) || 0,
        ordersCount: ordersByStoreMap.get(id.toString()) || 0,
    }));
    const monthCounts = new Map();
    const monthCountsByStore = new Map();
    for (const order of orders) {
        const d = new Date(order.orderDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
        const storeId = order.storeId.toString();
        if (!monthCountsByStore.has(storeId)) {
            monthCountsByStore.set(storeId, new Map());
        }
        const storeMonths = monthCountsByStore.get(storeId);
        storeMonths.set(key, (storeMonths.get(key) || 0) + 1);
    }
    const sortedMonths = Array.from(monthCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([month, count]) => ({ month, count }));
    const ordersByMonthByStore = storeIds.map((id) => {
        const storeMonths = monthCountsByStore.get(id.toString()) || new Map();
        const months = Array.from(storeMonths.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12)
            .map(([month, count]) => ({ month, count }));
        return {
            storeId: id,
            storeName: getStoreDisplay(id),
            ordersByMonth: months,
        };
    });
    const totalProductsSold = Array.from(productsByStoreMap.values()).reduce((a, b) => a + b, 0);
    const totalRevenue = Array.from(revenueByStoreMap.values()).reduce((a, b) => a + b, 0);
    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: roleName,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
                assignedSupportDeveloper: assignedDev
                    ? { username: assignedDev.username || "", email: assignedDev.email || "" }
                    : null,
            },
            stores: stores.map((s) => ({
                _id: s._id,
                storeName: s.storeName,
                storeCode: s.storeCode,
                storeDescription: s.storeDescription,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            })),
            totals: {
                storesCount: stores.length,
                ordersCount: orders.length,
                productsSold: totalProductsSold,
                totalRevenue,
            },
            ordersByMonth: sortedMonths,
            ordersByMonthByStore,
            productsByStore,
            revenueByStore,
        },
    });
});
