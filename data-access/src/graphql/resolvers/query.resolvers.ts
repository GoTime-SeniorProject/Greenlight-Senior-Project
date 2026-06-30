import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

import {
  findMongoOrganizations,
  findMongoDocuments,
  findMongoEvents,
  findMongoOrganizationById,
  findMongoOrganizationByUsername,
  findMongoEventById,
  organizationCollections,
  userCollections,
  eventCollections,
  locationCollections,
  purchaseCollections,
  mapMongoOrganization,
  mapMongoEvent
} from '../../db/mongoHelpers.js';

type Context = {
  mongoDb: Db;
};

export const queryResolvers = {
  // ─────────────────────────────
  // ORGANIZATIONS
  // ─────────────────────────────

  getOrganizations: async (_: unknown, args: any, ctx: Context) => {
    const query: any = {};

    if (args.username) query.username = args.username;

    const docs = await findMongoOrganizations(ctx.mongoDb, query);
    return docs.map(mapMongoOrganization).filter(Boolean);
  },

  getOrganization: async (_: unknown, args: any, ctx: Context) => {
    const doc =
      /^[a-fA-F0-9]{24}$/.test(args.id)
        ? await findMongoOrganizationById(ctx.mongoDb, args.id)
        : (await findMongoOrganizationById(ctx.mongoDb, args.id)) ??
          (await findMongoOrganizationByUsername(ctx.mongoDb, args.id));

    return mapMongoOrganization(doc);
  },

  // ─────────────────────────────
  // EVENTS
  // ─────────────────────────────

  getEvents: async (_: unknown, args: any, ctx: Context) => {
    const query: any = {};

    if (args.status) query.event_status = args.status;

    if (args.fromDate || args.toDate) {
      query.event_date = {};
      if (args.fromDate) query.event_date.$gte = args.fromDate;
      if (args.toDate) query.event_date.$lte = args.toDate;
    }

    const docs = await findMongoEvents(ctx.mongoDb, query);
    return docs.map(mapMongoEvent).filter(Boolean);
  },

  getEvent: async (_: unknown, args: any, ctx: Context) => {
    const doc = await findMongoEventById(ctx.mongoDb, args.id);
    return mapMongoEvent(doc);
  },

  getEventsByOrganization: async (_: unknown, args: any, ctx: Context) => {
    const query: any = {
      $or: [
        { organizationUsername: args.orgUsername },
        { organization_username: args.orgUsername },
        { organization: args.orgUsername }
      ]
    };

    if (args.status) query.event_status = args.status;

    const docs = await findMongoEvents(ctx.mongoDb, query);
    return docs.map(mapMongoEvent).filter(Boolean);
  },

  // ─────────────────────────────
  // USERS
  // ─────────────────────────────

  getUsers: async (_: unknown, args: any, ctx: Context) => {
    const query: any = {};

    if (args.username) query.username = args.username;

    const docs = await findMongoDocuments(
      userCollections(ctx.mongoDb),
      query
    );

    return docs.map((doc: any) => ({
      _id: String(doc._id),
      id: String(doc.id ?? doc._id),

      firstName: doc.first_name ?? doc.firstName ?? null,
      lastName: doc.last_name ?? doc.lastName ?? null,
      username: doc.username ?? null,

      profileImg: doc.profile_img ?? doc.profileImg ?? null,
      role: doc.role ?? null,

      organization:
        doc.organizationId ??
        doc.organization_id ??
        doc.organization ??
        null,

      organizationUsername:
        doc.organizationUsername ??
        doc.organization_username ??
        null,

      createdAt: doc.created_at ?? doc.createdAt ?? null,
      updatedAt: doc.updated_at ?? doc.updatedAt ?? null
    }));
  },

  getUser: async (_: unknown, args: any, ctx: Context) => {
    const objectId =
      /^[a-fA-F0-9]{24}$/.test(args.id) ? new ObjectId(args.id) : null;

    const docs = await findMongoDocuments(
      userCollections(ctx.mongoDb),
      {
        $or: [
          { id: args.id },
          { username: args.id },
          ...(objectId ? [{ _id: objectId }] : [])
        ]
      }
    );

    const doc = docs[0];
    if (!doc) return null;

    return {
      _id: String(doc._id),
      id: String(doc.id ?? doc._id),

      firstName: doc.first_name ?? doc.firstName ?? null,
      lastName: doc.last_name ?? doc.lastName ?? null,
      username: doc.username ?? null,

      profileImg: doc.profile_img ?? doc.profileImg ?? null,
      role: doc.role ?? null,

      organization:
        doc.organizationId ??
        doc.organization_id ??
        doc.organization ??
        null,

      organizationUsername:
        doc.organizationUsername ??
        doc.organization_username ??
        null,

      createdAt: doc.created_at ?? doc.createdAt ?? null,
      updatedAt: doc.updated_at ?? doc.updatedAt ?? null
    };
  },

  // ─────────────────────────────
  // LOCATIONS
  // ─────────────────────────────

  getLocations: async (_: unknown, args: any, ctx: Context) => {
    const docs = await findMongoDocuments(
      locationCollections(ctx.mongoDb),
      {}
    );

    return docs.map((doc: any) => ({
      _id: String(doc._id),
      id: String(doc.id ?? doc._id),

      buildingCode: doc.building_code ?? doc.buildingCode ?? null,
      buildingDisplayName:
        doc.building_display_name ?? doc.buildingDisplayName ?? null,

      roomTitle: doc.room_title ?? doc.roomTitle ?? null,
      roomType: doc.room_type ?? doc.roomType ?? null,

      maxCapacity: doc.max_capacity ?? doc.maxCapacity ?? null
    }));
  },

  getLocation: async (_: unknown, args: any, ctx: Context) => {
    const docs = await findMongoDocuments(
      locationCollections(ctx.mongoDb),
      { id: args.id }
    );

    const doc = docs[0];
    if (!doc) return null;

    return {
      _id: String(doc._id),
      id: String(doc.id ?? doc._id),

      buildingCode: doc.building_code ?? doc.buildingCode ?? null,
      buildingDisplayName:
        doc.building_display_name ?? doc.buildingDisplayName ?? null,

      roomTitle: doc.room_title ?? doc.roomTitle ?? null,
      roomType: doc.room_type ?? doc.roomType ?? null,

      maxCapacity: doc.max_capacity ?? doc.maxCapacity ?? null
    };
  },

  // ─────────────────────────────
  // PURCHASES
  // ─────────────────────────────

  getPurchases: async (_: unknown, __: any, ctx: Context) => {
    const docs = await findMongoDocuments(
      purchaseCollections(ctx.mongoDb),
      {}
    );

    return docs.map((doc: any) => ({
      _id: String(doc._id),
      id: String(doc.id ?? doc._id),

      organizationUsername:
        doc.organizationUsername ?? doc.organization_username ?? doc.organization ?? null,

      organization:
        doc.organizationId ?? doc.organization_id ?? doc.organization ?? null,

      dateSubmitted: doc.date_submitted ?? doc.dateSubmitted ?? null,
      itemTitle: doc.item_title ?? doc.itemTitle ?? null,
      itemCategory: doc.item_category ?? doc.itemCategory ?? null,
      eventId: doc.eventId ?? doc.event_id ?? null,
      orderStatus: doc.order_status ?? doc.orderStatus ?? null,
      itemCost: doc.item_cost ?? doc.itemCost ?? null
    }));
  },

  getPurchase: async (_: unknown, args: any, ctx: Context) => {
    const docs = await findMongoDocuments(
      purchaseCollections(ctx.mongoDb),
      { id: args.id }
    );

    const doc = docs[0];
    if (!doc) return null;

    return {
      _id: String(doc._id),
      id: String(doc.id ?? doc._id),

      organizationUsername:
        doc.organizationUsername ?? doc.organization_username ?? doc.organization ?? null,

      organization:
        doc.organizationId ?? doc.organization_id ?? doc.organization ?? null,

      dateSubmitted: doc.date_submitted ?? doc.dateSubmitted ?? null,
      itemTitle: doc.item_title ?? doc.itemTitle ?? null,
      itemCategory: doc.item_category ?? doc.itemCategory ?? null,
      eventId: doc.eventId ?? doc.event_id ?? null,
      orderStatus: doc.order_status ?? doc.orderStatus ?? null,
      itemCost: doc.item_cost ?? doc.itemCost ?? null
    };
  }
};