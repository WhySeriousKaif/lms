import express from "express";
import { createOrder, getAllOrdersAdmin } from "../controllers/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/create-order", isAuthenticated, createOrder);

router.get("/get-all-orders", isAuthenticated, authorizeRoles("admin"), getAllOrdersAdmin);

export default router;