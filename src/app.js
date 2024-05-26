import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN } from "./config/index.js";
import { APIError } from "./utils/APIError.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", CORS_ORIGIN],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

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
