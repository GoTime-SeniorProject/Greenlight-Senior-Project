import { buildSchema } from '../src/init/schema.js';
import serverless from 'serverless-http';
import express from 'express';

const app = express();

let schemaPromise = buildSchema();

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

// example route using your schema
app.get('/schema', async (req, res) => {
    const schema = await schemaPromise;
    res.json(schema);
});

export default serverless(app);