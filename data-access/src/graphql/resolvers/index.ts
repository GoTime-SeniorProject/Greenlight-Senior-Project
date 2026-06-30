import { queryResolvers } from "./query.resolvers.js";
import { mutationResolvers } from "./mutation.resolvers.js";

export const resolvers = {
    Query: {
        ...queryResolvers,
    },

    Mutation: {
        ...mutationResolvers,
    },
};