import express from "express";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/health/live", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
