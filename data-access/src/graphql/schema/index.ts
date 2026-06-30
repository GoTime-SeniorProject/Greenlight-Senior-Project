import path from "path";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

export const typeDefs = loadSchemaSync(
    path.join(process.cwd(), "src/graphql/schema"),
    {
        loaders: [new GraphQLFileLoader()],
    }
);