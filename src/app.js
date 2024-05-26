import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN } from "./config/index.js";
import { APIError } from "./utils/APIError.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rentify-flax.vercel.app",
      CORS_ORIGIN,
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Import routes
import userRoutes from "./routes/user.routes.js";
import propertiesRoutes from "./routes/properties.routes.js";

//Routes

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertiesRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  next(new APIError(404, "Route not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error : Error handling middleware : ", err);

  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      details: err.details || null,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      details: err,
    });
  }
});

export { app };
