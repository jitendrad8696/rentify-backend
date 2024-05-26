import express from "express";
import { verifyToken } from "../middlewares/verify.token.js";
import {
  postProperty,
  getProperties,
  deleteProperty,
  getPropertyById,
  updatePropertyById,
  filterProperties,
  sendOwnerInfo,
  toggleLikeProperty,
  getWatchlist,
} from "../controllers/properties.controllers.js";

const router = express.Router();

// All routes are secure
router.use(verifyToken);

router.post("/post-property", postProperty);

router.get("/get-properties", getProperties);

router.delete("/delete/:id", deleteProperty);

router.get("/getPropertyById/:id", getPropertyById);

router.put("/update/:id", updatePropertyById);

router.post("/filter", filterProperties);

router.post("/sendOwnerInfo", sendOwnerInfo);

router.post("/toggle-like", toggleLikeProperty);

router.get("/getMYwatchlist", getWatchlist);

export default router;
