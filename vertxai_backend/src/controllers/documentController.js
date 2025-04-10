// src/controllers/documentController.js

import Document from "../model/document.model.js";
import { deleteFromS3, uploadToS3 } from "../utils/s3Upload.js";

// Create a single Document
export const createDocument = async (req, res) => {
  try {
    const { dealId, sellerId, buyerId , type } = req.body;

    // Check if a file was provided
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file to AWS S3 and get back the URL
    const url = await uploadToS3(req.file, "documents");

    // Create a Document record in the database
    const document = new Document({ dealId, sellerId, buyerId, url, type });
    const saved = await document.save();

    res.status(201).json({ message: "Document uploaded", document: saved });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating document", error: err.message });
  }
};

// Get Documents
export const getDocuments = async (req, res) => {
  try {
    const { dealId, sellerId, buyerId } = req.query;

    const filter = {};
    if (dealId) filter.dealId = dealId;
    if (sellerId) filter.sellerId = sellerId;
    if (buyerId) filter.buyerId = buyerId;

    const docs = await Document.find(filter)
      .populate("sellerId", "name")
      .populate("buyerId", "name")
      .populate("dealId", "title");

    res.status(200).json(docs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching documents", error: err.message });
  }
};


// Delete Document (removes file from S3, then deletes from DB)
export const deleteDocument = async (req, res) => {
  try {
    // Find the document by ID
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the file from S3 using its URL
    await deleteFromS3(document.url);

    // Now remove the document record from the database
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting document",
      error: err.message,
    });
  }
};