import express from "express";
import serverless from "serverless-http";

const app = express();

app.get("/", (req, res) => {
  res.json({ ok: true });
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

export default serverless(app);