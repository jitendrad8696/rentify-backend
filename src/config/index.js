const requiredEnvVars = [
  "PORT",
  "CORS_ORIGIN",
  "DB_URI",
  "DB_NAME",
  "ACCESS_TOKEN_JWT",
  "ACCESS_TOKEN_EXPIRY",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
];

// Check for missing required environment variables
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Missing required environment variable ${varName}`);
    process.exit(1);
  }
});

export const PORT = process.env.PORT || 3000;

export const {
  CORS_ORIGIN,
  DB_URI,
  DB_NAME,
  ACCESS_TOKEN_JWT,
  ACCESS_TOKEN_EXPIRY,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
} = process.env;
