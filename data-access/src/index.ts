import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs } from "./graphql/schema/index.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { getDb } from "./db/mongo-client.js";
import express from "express";
import cors from "cors";

dotenv.config({ path: ".env.local" });

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

await server.start(); // IMPORTANT in v4

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/graphql",
    expressMiddleware(server, {
        context: async () => ({
            mongoDb: await getDb(),
        }),
    })
);

export default app;