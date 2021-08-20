import express, { Request, Response } from "express";
import db_pool from "../utils/db";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  //TODO: return questions after sql query
  db_pool.getConnection((err, db_con) => {
    if (err) {
      return res.status(500).send("Database Query Failed");
    }

    db_con.beginTransaction((err) => {
      if (err) throw err;

      db_con.query("SELECT * FROM question", (err, rows) => {
        if (err) {
          return db_con.rollback(() => {
            throw err;
          });
        }

        console.log(rows);
        return res.send(rows);
      });
    });
  });
});

interface ReqParams {
  questionId: number;
}
router.get("/:questionId", (req: Request<ReqParams>, res: Response) => {
  //TODO: complete this
  res.send(req.params);
});

export default router;
