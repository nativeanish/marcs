import express from "express";
import authHandler from "./auth-handler";

const app = express();

app.use("/api/auth", authHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
