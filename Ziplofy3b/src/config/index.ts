interface Config {
    allowedOrigins: (string | RegExp)[];
    clientUrl: string;
    storeRenderMicroserviceUrlSuffix: string;
}

const NODE_ENV = process.env.NODE_ENV || 'development';

let config: Config;

if (NODE_ENV === 'development') {
    config = {
        allowedOrigins: [
            "http://admin.localhost:5173",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            // Allow any subdomain of localhost:5173 (e.g., admin.localhost:5173)
            /^http:\/\/([a-z0-9-]+\.)*localhost:5173$/i,
            // If you also run https locally via proxy/certs
            /^https:\/\/([a-z0-9-]+\.)*localhost:5173$/i,
            // Allow any subdomain of localhost:5180 (e.g., foo.localhost:5180)
            /^http:\/\/([a-z0-9-]+\.)*localhost:5180$/i,
            /^https:\/\/([a-z0-9-]+\.)*localhost:5180$/i,
        ],
        clientUrl: "http://admin.localhost:5173",
        storeRenderMicroserviceUrlSuffix: ".localhost:5180"
    };
} else {
    config = {
        allowedOrigins: [
            // Merchant storefronts (*.codiic.com), dashboard, admin, auth, preview
            /^https?:\/\/([a-z0-9-]+\.)*codiic\.com$/i,
            "https://api.codiic.com",
            "https://auth.codiic.com",
            "https://dashboard.codiic.com",
            "https://admin.codiic.com",
            "https://preview.codiic.com",
        ],
        clientUrl: "https://dashboard.codiic.com",
        storeRenderMicroserviceUrlSuffix: ".codiic.com"
    };
}

export { config };


