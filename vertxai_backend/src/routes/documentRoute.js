// src/routes/document.route.js

import express from "express";
import multer from "multer";
import {
  createDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentController.js";
import authCheck from "../middlewares/authCheck.js";

// Multer in-memory storage (files available as a buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Use upload.single to handle a single file upload with field name "document"
router.post(
  "/",
  authCheck(["seller", "buyer"]),
  upload.single("document"),
  createDocument
);
router.get("/", authCheck(["seller", "buyer"]), getDocuments);
router.delete("/:id", authCheck(["seller", "buyer"]), deleteDocument);

export default router;
