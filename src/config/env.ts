import dotenv from 'dotenv';
dotenv.config();

if (!process.env.API_URL) {
  throw new Error('API_URL is not set');
}
if (!process.env.UI_URL) {
  throw new Error('UI_URL is not set');
}

export const env = {
  API_URL: process.env.API_URL,
  UI_URL: process.env.UI_URL,
};