import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from "../controllers/userController.js";
import authCheck from "../middlewares/authCheck.js";


const router = express.Router();

router.post("/login", loginUser);
router.get("/",authCheck(["seller","buyer"]) ,getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
