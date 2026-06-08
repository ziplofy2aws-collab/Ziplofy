interface Config {
    allowedOrigins: string[];
}

const NODE_ENV = process.env.NODE_ENV || 'development';

let config: Config;

if (NODE_ENV === 'development') {
    config = {
        allowedOrigins: [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    };
} else {
    config = {
        allowedOrigins: [
            "https://auth.ziplofy.com",
        ]
    };
}

export { config };


