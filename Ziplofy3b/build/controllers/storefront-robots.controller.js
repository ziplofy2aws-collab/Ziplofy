"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorefrontRobots = void 0;
const error_utils_1 = require("../utils/error.utils");
const robots_txt_util_1 = require("../utils/robots-txt.util");
const storefront_host_util_1 = require("../utils/storefront-host.util");
exports.getStorefrontRobots = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const resolved = await (0, storefront_host_util_1.resolveStoreFromRequest)(req);
    if (!resolved) {
        throw new error_utils_1.CustomError('Store not found for this hostname', 404);
    }
    const text = (0, robots_txt_util_1.buildRobotsTxt)(resolved.publicOrigin);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(text);
});
