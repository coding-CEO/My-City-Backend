import express, { Request, Response } from "express";
import db_pool from "../utils/db";

const router = express.Router();

interface ReqBody {
  authoritySpecialId: string;
}

router.post("/", async (req: Request<any, any, ReqBody>, res: Response) => {
  const authoritySpecialId = req.body.authoritySpecialId;

  db_pool.getConnection((err, db_con) => {
    if (err) {
      return res.status(500).send("Database Error " + err.message);
    }

    const query =
      "SELECT * FROM authority WHERE authoritySpecialId = ? LIMIT 1";

    db_con.query(query, [authoritySpecialId], (err, rows) => {
      db_con.release();
      if (err) {
        return res.status(500).send("Database Error " + err.message);
      }
      return res.send(rows);
    });
  });
});

export default router;
