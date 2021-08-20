import express, { Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler";
import bcrypt from "bcryptjs";

const router = express.Router();

interface ReqBody {
  authoritySpecialId: string;
}

router.post("/", async (req: Request<any, any, ReqBody>, res: Response) => {
  try {
    const salt = await bcrypt.genSalt(10);
    let hashedAuthoritySpecialId = await bcrypt.hash(
      req.body.authoritySpecialId,
      salt
    );
    return res.send(hashedAuthoritySpecialId);
  } catch (error) {
    ErrorHandler.handle(error);
  }
});

export default router;
