import express from "express";
import serverless from "serverless-http";
import { buildSchema } from "../init/schema.js";

const app = express();

let schemaPromise = buildSchema();

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.get("/schema", async (req, res) => {
    const schema = await schemaPromise;
    res.json(schema);
});

export default serverless(app);