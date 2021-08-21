import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import loginRouter from "./LoginRoutes/loginRoute";
import questionRouter from "./QuestionRoutes/QuestionRoute";
import answerRouter from "./AnswerRoutes/AnswerRoute";

const app = express();

///////////////////////
// EXTRA STUFF HERE...
dotenv.config();
app.use(cors());
app.use(express.json());

///////////////////////
// MIDDLEWARES HERE...
app.use("/login", loginRouter);
app.use("/questions", questionRouter);
app.use("/answers", answerRouter);

///////////////////////
// LISTENING STARTS HERE...
let PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running at Port ${PORT}`));
