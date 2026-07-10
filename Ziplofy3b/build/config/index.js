"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const NODE_ENV = process.env.NODE_ENV || 'development';
let config;
if (NODE_ENV === 'development') {
    exports.config = config = {
        allowedOrigins: [
            "http://localhost:5173",
            "http://localhost:5174",
            // Allow any subdomain of localhost:5173 (e.g., foo.localhost:5173)
            /^http:\/\/([a-z0-9-]+\.)*localhost:5173$/i,
            // If you also run https locally via proxy/certs
            /^https:\/\/([a-z0-9-]+\.)*localhost:5173$/i,
            // Allow any subdomain of localhost:5180 (e.g., foo.localhost:5180)
            /^http:\/\/([a-z0-9-]+\.)*localhost:5180$/i,
            /^https:\/\/([a-z0-9-]+\.)*localhost:5180$/i,
        ],
        clientUrl: "http://localhost:5173",
        storeRenderMicroserviceUrlSuffix: ".localhost:5180"
    };
}
else {
    exports.config = config = {
        allowedOrigins: [
            // Allow any subdomain of ziplofy.com (e.g., gibberish.ziplofy.com, dashboard.ziplofy.com)
            /^https?:\/\/([a-z0-9-]+\.)*ziplofy\.com$/i,
            "https://admin.ziplofy.com"
        ],
        clientUrl: "https://dashboard.ziplofy.com",
        storeRenderMicroserviceUrlSuffix: ".ziplofy.com"
    };
}
