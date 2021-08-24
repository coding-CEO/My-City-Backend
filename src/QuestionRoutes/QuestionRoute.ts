import express, { Request, Response } from "express";
import db_pool from "../utils/db";
import multer from "multer";
import fs from "fs";
import { ImageHandler } from "../utils/ImageHandler";

const router = express.Router();

interface ReqQuery {
  hashedAadharNumber?: string;
  stateIndex?: string;
  cityIndex?: string;
  question_type?: string;
}

router.get("/", (req: Request<any, any, any, ReqQuery>, res: Response) => {
  if (
    !req.query.cityIndex ||
    !req.query.stateIndex ||
    !req.query.question_type
  ) {
    return res.status(400).send("Wrong Query Params");
  }
  db_pool.getConnection((err, db_con) => {
    if (err) {
      return res.status(500).send("Database Query Failed " + err.message);
    }

    let query = "SELECT * FROM question";
    let whereClause = "";
    let values: any[] = [];
    if (req.query.stateIndex !== "0") {
      whereClause += "stateIndex = ? AND ";
      values.push(Number(req.query.stateIndex) - 1);
    }
    if (req.query.cityIndex !== "0") {
      whereClause += "cityIndex = ? AND ";
      values.push(Number(req.query.cityIndex) - 1);
    }
    if (req.query.hashedAadharNumber) {
      whereClause += "hashedAadharNumber = ? AND ";
      values.push(req.query.hashedAadharNumber);
    }
    if (req.query.question_type === "1") {
      whereClause += "answerId >= ? AND ";
      values.push(0);
    } else if (req.query.question_type === "2") {
      whereClause += "answerId < ? AND ";
      values.push(0);
    }

    if (whereClause.length > 0) {
      whereClause = whereClause.substring(0, whereClause.length - 5);
      query += " WHERE " + whereClause;
    }

    query += " ORDER BY timestamp DESC";

    db_con.query(query, values, (err, rows) => {
      db_con.release();
      if (err) {
        return res.status(500).send("Database Query Failed" + err.message);
      }
      return res.send(rows);
    });
  });
});

/////////////////////////////////

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
}).single("questionImg");

interface Question {
  citizenHashedAadharNumber: string;
  title: string;
  description: string;
  timestamp: string;
  //Here state and city index are 0 based indexed
  stateIndex: string;
  cityIndex: string;
  area: string;
}

router.post("/", (req: Request<any, any, Question>, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send("Image upload error");
    }
    let questionImgUrl = "";
    if (req.file) {
      try {
        questionImgUrl = await ImageHandler.imageUploadAndGetPublicUrl(
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

      const query =
        "INSERT INTO question (hashedAadharNumber, title, description, img_url, answerId, timestamp, stateIndex, cityIndex, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

      db_con.query(
        query,
        [
          req.body.citizenHashedAadharNumber,
          req.body.title,
          req.body.description,
          questionImgUrl,
          -1,
          Number(req.body.timestamp),
          Number(req.body.stateIndex),
          Number(req.body.cityIndex),
          req.body.area,
        ],
        (err, rows) => {
          db_con.release();
          if (err) {
            return res.status(500).send("Database Error " + err.message);
          }
          return res.send({ questionId: rows.insertId });
        }
      );
    });
  });
});

/////////////////////////////////////

interface ReqParams {
  questionId: number;
}
router.get("/:questionId", (req: Request<ReqParams>, res: Response) => {
  db_pool.getConnection((err, db_con) => {
    if (err) {
      return res.status(500).send("Database Error " + err.message);
    }
    const query = "SELECT * FROM question WHERE questionId = ? LIMIT 1";
    db_con.query(query, [req.params.questionId], (err, rows) => {
      db_con.release();
      if (err) {
        return res.status(500).send("Database Error " + err.message);
      }
      return res.send(rows);
    });
  });
});

export default router;
