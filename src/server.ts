import express, { Request, Response } from "express";
import config from "./config";
import initDB from "./config/db";

const app = express();
const PORT = process.env.PORT || 3000;

initDB();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
