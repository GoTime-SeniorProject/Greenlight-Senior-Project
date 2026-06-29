import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from '../init/schema.js';
import { getDb } from '../db/mongo-client.js';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
    const mongoDb = await getDb();
    const schema = await buildSchema();

    return createHandler({
        schema,
        context: () => ({ mongoDb }),
    })(req, res, () => {});
}