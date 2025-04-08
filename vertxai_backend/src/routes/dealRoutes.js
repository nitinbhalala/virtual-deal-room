// src/routes/deal.route.js
import express from "express";
import {
  createDeal,
  getDeals,
  updateDeal,
  deleteDeal,
} from "../controllers/dealController.js";
import authCheck from "../middlewares/authCheck.js";

const router = express.Router();

router.post("/", authCheck(["seller", "buyer"]), createDeal);
router.get("/", authCheck(["seller", "buyer"]), getDeals);
router.put("/:id", authCheck(["seller", "buyer"]), updateDeal);
router.delete("/:id", authCheck(["seller", "buyer"]), deleteDeal);

export default router;
