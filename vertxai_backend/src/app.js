import express from "express";
import { connectDB } from "./config/config.js";
import userRoutes from "./routes/userRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import documentRoute from "./routes/documentRoute.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

connectDB();
app.use("/api/users", userRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/document", documentRoute);

app.get("/", (req, res) => {
  res.send("Welcome to VertxAI API");
});

export default app;
