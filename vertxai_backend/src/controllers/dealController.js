// // src/controllers/dealController.js
// import Deal from "../model/deal.model.js";
// import User from "../model/user.model.js";

// // Create Deal
// export const createDeal = async (req, res) => {
//   try {
//     const { title, description, price, status } = req.body;
//     const userId = req.user.id;

//     const deal = new Deal({ title, description, price, userId, status });
//     const savedDeal = await deal.save();

//     res
//       .status(201)
//       .json({ message: "Deal created successfully", deal: savedDeal });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error while creating deal", error: err.message });
//   }
// };

// // Get Deal by ID (from req.body) or All Deals (optionally filtered by ?userId=...)
// export const getDeals = async (req, res) => {
//   try {
//     const { id, userId, status } = req.query;

//     if (id) {
//       const deal = await Deal.findById(id).populate("userId", "name email");
//       if (!deal) {
//         return res.status(404).json({ message: "Deal not found" });
//       }
//       return res.status(200).json(deal);
//     }

//     // Build dynamic filter
//     const filter = {};
//     if (userId) filter.userId = userId;
//     if (status) filter.status = status;

//     const deals = await Deal.find(filter).populate("userId", "name email role");
//     res.status(200).json(deals);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching deals", error: err.message });
//   }
// };


// // Update Deal
// export const updateDeal = async (req, res) => {
//   try {
//     const updatedDeal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updatedDeal) {
//       return res.status(404).json({ message: "Deal not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Deal updated successfully", deal: updatedDeal });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error while updating deal", error: err.message });
//   }
// };

// // Delete Deal
// export const deleteDeal = async (req, res) => {
//   try {
//     const deletedDeal = await Deal.findByIdAndDelete(req.params.id);
//     if (!deletedDeal) {
//       return res.status(404).json({ message: "Deal not found" });
//     }
//     res.status(200).json({ message: "Deal deleted successfully" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error while deleting deal", error: err.message });
//   }
// };


import Deal from "../model/deal.model.js";
import User from "../model/user.model.js";

// Create Deal
export const createDeal = async (req, res) => {
  try {
    const { title, description, price, status, sellerId, buyerId } = req.body;

    const deal = new Deal({
      title,
      description,
      price,
      status,
      sellerId,
      buyerId,
    });
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

// Get Deals or Deal by ID
export const getDeals = async (req, res) => {
  try {
    const { id, sellerId, buyerId, status } = req.query;

    const filter = {};
    if (sellerId) filter.sellerId = sellerId;
    if (buyerId) filter.buyerId = buyerId;
    if (status) filter.status = status;

    if (id) {
      const deal = await Deal.findById(id)
        .populate("sellerId", "name")
        .populate("buyerId", "name");

      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const formatted = {
        ...deal.toObject(),
        seller: deal.sellerId,
        buyer: deal.buyerId,
      };

      delete formatted.sellerId;
      delete formatted.buyerId;

      return res.status(200).json(formatted);
    }

    const deals = await Deal.find(filter)
      .populate("sellerId", "name")
      .populate("buyerId", "name");

    const formattedDeals = deals.map((deal) => {
      const obj = deal.toObject();
      obj.seller = obj.sellerId;
      obj.buyer = obj.buyerId;
      delete obj.sellerId;
      delete obj.buyerId;
      return obj;
    });

    res.status(200).json(formattedDeals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching deals", error: err.message });
  }
};


// Update Deal
export const updateDeal = async (req, res) => {
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("sellerId", "name email role")
      .populate("buyerId", "name email role");

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
