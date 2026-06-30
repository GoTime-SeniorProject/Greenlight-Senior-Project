import { mergeTypeDefs } from "@graphql-tools/merge";

import { schema } from "./schema.js";
import { queries } from "./types/queries.js";
import { mutations } from "./types/mutations.js";

export const typeDefs = mergeTypeDefs([
    schema,
    queries,
    mutations
]);