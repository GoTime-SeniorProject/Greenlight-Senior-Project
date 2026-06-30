import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs } from "./src/graphql/schema/index";
import { resolvers } from "./src/graphql/resolvers";
import { getDb } from "./src/db/mongo-client";
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