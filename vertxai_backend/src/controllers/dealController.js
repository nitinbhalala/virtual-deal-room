// src/controllers/dealController.js
import Deal from "../model/deal.model.js";

// Create Deal
export const createDeal = async (req, res) => {
  try {
    const { title, description, price, status } = req.body;
    const userId = req.user.id;

    const deal = new Deal({ title, description, price, userId, status });
    const savedDeal = await deal.save();

    res
      .status(201)
      .json({ message: "Deal created successfully", deal: savedDeal });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while creating deal", error: err.message });
  }
};

// Get Deal by ID (from req.body) or All Deals (optionally filtered by ?userId=...)
export const getDeals = async (req, res) => {
  try {
    const { id, userId, status } = req.query;

    if (id) {
      const deal = await Deal.findById(id).populate("userId", "name email");
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      return res.status(200).json(deal);
    }

    // Build dynamic filter
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const deals = await Deal.find(filter).populate("userId", "name email role");
    res.status(200).json(deals);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching deals", error: err.message });
  }
};


// Update Deal
export const updateDeal = async (req, res) => {
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }
    res
      .status(200)
      .json({ message: "Deal updated successfully", deal: updatedDeal });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while updating deal", error: err.message });
  }
};

// Delete Deal
export const deleteDeal = async (req, res) => {
  try {
    const deletedDeal = await Deal.findByIdAndDelete(req.params.id);
    if (!deletedDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }
    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while deleting deal", error: err.message });
  }
};
