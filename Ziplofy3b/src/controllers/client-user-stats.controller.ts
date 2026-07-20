import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Order, OrderItem } from "../models";
import { Store } from "../models/store/store.model";
import { User } from "../models/user.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

/**
 * Get client user details and aggregate stats (orders, products sold).
 * Super-admin or support-admin only.
 */
export const getClientUserStats = asyncErrorHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };
  const userRole = (req.user as any)?.role;
  const isSuperAdmin = (req.user as any)?.superAdmin;
  const isSupportAdmin = userRole?.toLowerCase() === "support-admin";

  if (!isSuperAdmin && !isSupportAdmin) {
    throw new CustomError("Only super-admin or support-admin can view client user stats", 403);
  }

  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new CustomError("Valid user ID is required", 400);
  }

  const user = await User.findById(userId)
    .select("-password")
    .populate("role", "name")
    .populate("assignedSupportDeveloperId", "username email")
    .lean();
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const role = user.role as { name?: string } | undefined;
  const roleName = (role?.name ?? "") || "";
  const assignedDev = user.assignedSupportDeveloperId as { username?: string; email?: string } | null | undefined;
  const adminRoles = ["super-admin", "support-admin", "client-admin", "developer-admin"];
  if (adminRoles.includes(roleName.toLowerCase())) {
    throw new CustomError("This user is an admin, not a client user", 400);
  }

  const stores = await Store.find({ userId: new Types.ObjectId(userId) }).lean();
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

  const orders = await Order.find({ storeId: { $in: storeIds } })
    .select("storeId orderDate total status")
    .lean();

  const orderIds = orders.map((o) => o._id);
  const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
    .select("orderId quantity total")
    .lean();

  const orderIdToStoreId = new Map(orders.map((o) => [o._id.toString(), o.storeId.toString()]));

  const productsByStoreMap = new Map<string, number>();
  const revenueByStoreMap = new Map<string, number>();
  const ordersByStoreMap = new Map<string, number>();

  for (const item of orderItems) {
    const storeId = orderIdToStoreId.get(item.orderId.toString());
    if (!storeId) continue;
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
  const storeIdToCode = new Map(stores.map((s) => [s._id.toString(), (s as any).storeCode]));

  const getStoreDisplay = (id: mongoose.Types.ObjectId) => {
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

  const monthCounts = new Map<string, number>();
  const monthCountsByStore = new Map<string, Map<string, number>>();
  for (const order of orders) {
    const d = new Date(order.orderDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    const storeId = order.storeId.toString();
    if (!monthCountsByStore.has(storeId)) {
      monthCountsByStore.set(storeId, new Map());
    }
    const storeMonths = monthCountsByStore.get(storeId)!;
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
        storeCode: (s as any).storeCode,
        storeDescription: (s as any).storeDescription,
        createdAt: (s as any).createdAt,
        updatedAt: (s as any).updatedAt,
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
