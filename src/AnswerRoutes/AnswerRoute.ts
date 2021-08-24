import express, { Request, Response } from "express";
import db_pool from "../utils/db";
import multer from "multer";
import fs from "fs";
import { ImageHandler } from "../utils/ImageHandler";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "./public/temp";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } else {
      cb(null, dir);
    }
  },
  filename: (req, file, cb) => {
    let fileInfo = file.mimetype.split("/");
    cb(null, Date.now() + "." + fileInfo[1]);
  },
});
const upload = multer({
  storage: storage,
}).single("answerImg");

interface Answer {
  title: string;
  description: string;
  timestamp: string;
  questionId: string;
}

router.post("/", (req: Request<any, any, Answer>, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send("Image upload error");
    }

    let answerImgUrl = "";
    if (req.file) {
      try {
        answerImgUrl = await ImageHandler.imageUploadAndGetPublicUrl(
          req.file.path
        );
      } catch (error) {
        return res.status(500).send("Image upload error");
      }
    }

    db_pool.getConnection((err, db_con) => {
      if (err) {
        return res.status(500).send("Database Error " + err.message);
      }

      db_con.beginTransaction((err) => {
        if (err) {
          db_con.release();
          return res.status(500).send("Database Error " + err.message);
        }

        const insertAnsQuery =
          "INSERT INTO answer (title, description, timestamp, img_url) VALUES (?, ?, ?, ?)";

        db_con.query(
          insertAnsQuery,
          [
            req.body.title,
            req.body.description,
            Number(req.body.timestamp),
            answerImgUrl,
          ],
          (err, rows) => {
            if (err) {
              db_con.release();
              return db_con.rollback(() => {
                res.status(500).send("Database Error " + err.message);
              });
            }
            const answerId = Number(rows.insertId);
            const questionId = Number(req.body.questionId);
            const giveRefOfAnsInQuestionQuery =
              "UPDATE question SET answerId = ? WHERE questionId = ?";

            db_con.query(
              giveRefOfAnsInQuestionQuery,
              [answerId, questionId],
              (err) => {
                if (err) {
                  db_con.release();
                  return db_con.rollback(() => {
                    res.status(500).send("Database Error " + err.message);
                  });
                }
                db_con.commit((err) => {
                  db_con.release();
                  if (err) {
                    return db_con.rollback(() => {
                      res.status(500).send("Database Error " + err.message);
                    });
                  }
                  return res.send({ answerId: answerId });
                });
              }
            );
          }
        );
      });
    });
  });
});

/////////////////////////////////////

interface ReqParams {
  answerId: number;
}
router.get("/:answerId", (req: Request<ReqParams>, res: Response) => {
  db_pool.getConnection((err, db_con) => {
    if (err) {
      return res.status(500).send("Database Error " + err.message);
    }
    const query = "SELECT * FROM answer WHERE answerId = ? LIMIT 1";
    db_con.query(query, [req.params.answerId], (err, rows) => {
      db_con.release();
      if (err) {
        return res.status(500).send("Database Error " + err.message);
      }
      return res.send(rows);
    });
  });
});

export default router;
