import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

dotenv.config({ path: "./.env" });
const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello Welcome to Leetlab");
});

app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
