import express, { Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler";
import md5 from "md5";

const router = express.Router();

interface ReqBody {
  aadharNumber: string;
}

router.post("/", async (req: Request<any, any, ReqBody>, res: Response) => {
  try {
    const aadharNumber = req.body.aadharNumber;
    const hashedAadharNumber: string = md5(aadharNumber);
    return res.send(hashedAadharNumber);
  } catch (error) {
    ErrorHandler.handle(error);
  }
});

export default router;
