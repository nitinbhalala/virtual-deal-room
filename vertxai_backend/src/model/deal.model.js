// import mongoose from "mongoose";

// const dealSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, default: "" },
//     price: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ["pending", "inProgress" , "completed"],
//       default: "pending",
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// // ✅ Default export required
// const Deal = mongoose.model("Deal", dealSchema);
// export default Deal;


import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "inProgress", "completed", "cancelled"],
      default: "pending",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    messages: {
      type: Number,
      default: 0,
    },
    documents: {
      type: Number,
      default: 0,
    },
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Deal = mongoose.model("Deal", dealSchema);
export default Deal;  
