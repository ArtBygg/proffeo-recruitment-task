//const SERVER_BASE = 'test.proffeo.net';
const SERVER_BASE = 'proffeo.net';

export const environment = {
  production: false,
  appVersion: '1.0.0',
  AvatarsEndPoint: `https://${SERVER_BASE}/`,
  APIEndPoint: `https://api.${SERVER_BASE}/api/v2.0/`,
  APIV3EndPoint: `https://api.${SERVER_BASE}/api/v3.0/`,
  ServerUrl: `https://${SERVER_BASE}/`,
  overrideCredentials: false

  // AvatarsEndPoint: `http://localhost:37107/`,
  // APIEndPoint: `http://localhost:37107/api/v2.0/`,
  // APIV3EndPoint: `http://localhost:37107/api/v3.0/`,
  // ServerUrl: `http://localhost:37107/`,
};
