import express from "express";
import { getUsersAnalytics, getCoursesAnalytics, getOrdersAnalytics } from "../controllers/analytics.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";

const router = express.Router();

router.get("/get-users-analytics", isAuthenticated, authorizeRoles("admin"), getUsersAnalytics);
router.get("/get-courses-analytics", isAuthenticated, authorizeRoles("admin"), getCoursesAnalytics);
router.get("/get-orders-analytics", isAuthenticated, authorizeRoles("admin"), getOrdersAnalytics);

export default router;

