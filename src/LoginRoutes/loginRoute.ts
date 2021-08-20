import express from "express";
import citizenLoginRouter from "./citizenLoginRoute";
import authorityLoginRouter from "./authorityLoginRoute";

const router = express.Router();

router.use("/citizen", citizenLoginRouter);
router.use("/authority", authorityLoginRouter);

export default router;
