// Use environment variable in production, fallback to localhost in development
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
