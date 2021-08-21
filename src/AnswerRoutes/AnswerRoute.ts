import express, { Request, Response } from "express";
import db_pool from "../utils/db";
import multer from "multer";
import fs from "fs";

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
  //TODO: complete this
}

router.post("/", (req: Request<any, any, Answer>, res: Response) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send("Image upload error");
    }
    let answerImgUrl = "";
    if (req.file) {
      //TODO: upload image to AWS S3 here
      //answerImgUrl = uploadImg(req.file.path);
    }

    db_pool.getConnection((err, db_con) => {
      if (err) {
        return res.status(500).send("Database Error " + err.message);
      }

      //TODO: add proper fields
      const query = "INSERT INTO answer () VALUES ()";

      //TODO: add proper values
      db_con.query(query, [], (err, rows) => {
        db_con.release();
        if (err) {
          return res.status(500).send("Database Error " + err.message);
        }
        return res.send({ answerId: rows.insertId });
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
