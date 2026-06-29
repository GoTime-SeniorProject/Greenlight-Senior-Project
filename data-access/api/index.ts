import express from "express";
import serverless from "serverless-http";

const app = express();

app.get("/", (req, res) => {
  res.json({ step: "A ok" });
});

console.log("FUNCTION LOADED");

export default serverless(app);