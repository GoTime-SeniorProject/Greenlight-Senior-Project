import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

import {
    normalizeEventStatus,
} from '../../db/mongoHelpers.js';

type Context = {
    mongoDb: Db;
};

export const mutationResolvers = {
  // ─────────────────────────────
  // ORGANIZATION
  // ─────────────────────────────

    createOrganization: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        const result = await ctx.mongoDb
        .collection('organizations')
        .insertOne(dbInput);

        return ctx.mongoDb
        .collection('organizations')
        .findOne({ _id: result.insertedId });
    },

    updateOrganization: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        await ctx.mongoDb.collection('organizations').updateOne(
        { _id: new ObjectId(args.id) },
        { $set: dbInput }
        );

        return ctx.mongoDb
        .collection('organizations')
        .findOne({ _id: new ObjectId(args.id) });
    },

    deleteOrganization: async (_: unknown, args: any, ctx: Context) => {
        const result = await ctx.mongoDb
        .collection('organizations')
        .deleteOne({ _id: new ObjectId(args.id) });

        return result.deletedCount > 0;
    },

    // ─────────────────────────────
    // EVENT
    // ─────────────────────────────

    createEvent: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        const result = await ctx.mongoDb
        .collection('events')
        .insertOne(dbInput);

        return ctx.mongoDb
        .collection('events')
        .findOne({ _id: result.insertedId });
    },

    updateEvent: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        await ctx.mongoDb.collection('events').updateOne(
        { _id: new ObjectId(args.id) },
        { $set: dbInput }
        );

        return ctx.mongoDb
        .collection('events')
        .findOne({ _id: new ObjectId(args.id) });
    },

    deleteEvent: async (_: unknown, args: any, ctx: Context) => {
        const result = await ctx.mongoDb
        .collection('events')
        .deleteOne({ _id: new ObjectId(args.id) });

        return result.deletedCount > 0;
    },

    changeEventStatus: async (_: unknown, args: any, ctx: Context) => {
        const status = normalizeEventStatus(args.status);

        await ctx.mongoDb.collection('events').updateOne(
        { _id: new ObjectId(args.id) },
        { $set: { event_status: status } }
        );

        return ctx.mongoDb
        .collection('events')
        .findOne({ _id: new ObjectId(args.id) });
    },

    // ─────────────────────────────
    // USER
    // ─────────────────────────────

    createUser: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        const result = await ctx.mongoDb
        .collection('users')
        .insertOne(dbInput);

        return ctx.mongoDb
        .collection('users')
        .findOne({ _id: result.insertedId });
    },

    updateUser: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        await ctx.mongoDb.collection('users').updateOne(
        { _id: new ObjectId(args.id) },
        { $set: dbInput }
        );

        return ctx.mongoDb
        .collection('users')
        .findOne({ _id: new ObjectId(args.id) });
    },

    deleteUser: async (_: unknown, args: any, ctx: Context) => {
        const result = await ctx.mongoDb
        .collection('users')
        .deleteOne({ _id: new ObjectId(args.id) });

        return result.deletedCount > 0;
    },

    // ─────────────────────────────
    // PURCHASE
    // ─────────────────────────────

    createPurchase: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        const result = await ctx.mongoDb
        .collection('purchases')
        .insertOne(dbInput);

        return ctx.mongoDb
        .collection('purchases')
        .findOne({ _id: result.insertedId });
    },

    updatePurchase: async (_: unknown, args: any, ctx: Context) => {
        const dbInput = args.input || {};

        await ctx.mongoDb.collection('purchases').updateOne(
        { _id: new ObjectId(args.id) },
        { $set: dbInput }
        );

        return ctx.mongoDb
        .collection('purchases')
        .findOne({ _id: new ObjectId(args.id) });
    },

    deletePurchase: async (_: unknown, args: any, ctx: Context) => {
        const result = await ctx.mongoDb
        .collection('purchases')
        .deleteOne({ _id: new ObjectId(args.id) });

        return result.deletedCount > 0;
    }
};