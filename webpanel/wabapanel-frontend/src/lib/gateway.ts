// Gateway (portal) URLs — login/logout live on the gateway app, not the panel.
export const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3010';
export const GATEWAY_LOGIN_URL = `${GATEWAY_URL}/login`;
export const GATEWAY_LOGOUT_URL = `${GATEWAY_URL}/logout`;
