import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";

const typesArray = loadFilesSync(
    path.join(process.cwd(), "src/graphql/schema/**/*.graphql")
);

export const typeDefs = typesArray;