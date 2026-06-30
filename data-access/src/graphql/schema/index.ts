import fs from "fs";
import path from "path";

const load = (file: string) =>
    fs.readFileSync(
        path.join(process.cwd(), "src/graphql/schema", file),
        "utf8"
    );

export const typeDefs = `
    ${load("types/queries.graphql")}
    ${load("types/mutations.graphql")}
    ${load("schema.graphql")}
`;