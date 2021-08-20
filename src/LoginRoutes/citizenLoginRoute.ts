import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ErrorHandler } from "../utils/ErrorHandler";

const router = express.Router();

interface ReqBody {
  aadharNumber: string;
}

router.post("/", async (req: Request<any, any, ReqBody>, res: Response) => {
  try {
    const salt = await bcrypt.genSalt(10);
    let hashedAadharNumber = await bcrypt.hash(req.body.aadharNumber, salt);
    return res.send(hashedAadharNumber);
  } catch (error) {
    ErrorHandler.handle(error);
  }
});

export default router;
