import type { Pool, RowDataPacket } from 'mysql2/promise';
import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import {
  eventInputToDb,
  mapEventRow,
  mapLocationRow,
  mapOrganizationRow,
  mapPurchaseRow,
  mapUserRow,
  organizationInputToDb,
  purchaseInputToDb,
  userInputToDb,
  DbRow
} from '../db/mappers.js';
import {
  DateScalar,
  DateTimeScalar,
  JsonScalar,
  TimeScalar
} from './scalars.js';
import {
  fetchLocationById,
  fetchOrganizationById,
  fetchOrganizationByUsername,
  normalizeEventInput,
  normalizePurchaseInput,
  normalizeEventStatus
} from './helpers.js';

type Context = {
  pool: Pool;
  mongoDb?: Db;
};

function mapMongoOrganization(doc: any) {
  if (!doc) return null;
  return {
    id: String(doc.id ?? doc._id),
    orgName: doc.org_name ?? doc.orgName ?? null,
    username: doc.username ?? null,
    bio: doc.bio ?? null,
    orgImg: doc.org_img ?? doc.orgImg ?? null,
    createdAt: doc.created_at ?? doc.createdAt ?? null,
    updatedAt: doc.updated_at ?? doc.updatedAt ?? null
  };
}

function organizationCollections(db: Db) {
  return [db.collection('organizations'), db.collection('greenlight-orgs'), db.collection('orgs')];
}

async function findMongoOrganizations(db: Db, query: Record<string, any>) {
  const docs = await Promise.all(
    organizationCollections(db).map(async (collection) => collection.find(query).sort({ id: 1 }).toArray())
  );
  return docs.flat();
}

async function findMongoOrganizationByUsername(db: Db, username: string) {
  for (const collection of organizationCollections(db)) {
    const doc = await collection.findOne({ username });
    if (doc) return doc;
  }
  return null;
}

async function findMongoOrganizationById(db: Db, id: string) {
  const numericId = Number(id);
  const objectIdMatch = /^[a-fA-F0-9]{24}$/.test(id) ? new ObjectId(id) : null;

  for (const collection of organizationCollections(db)) {
    if (objectIdMatch) {
      const byObjectId = await collection.findOne({ _id: objectIdMatch });
      if (byObjectId) return byObjectId;
    }
    if (Number.isFinite(numericId)) {
      const byNumericId = await collection.findOne({ id: numericId });
      if (byNumericId) return byNumericId;
    }
    const byStringId = await collection.findOne({ id });
    if (byStringId) return byStringId;
  }

  return null;
}

export const resolvers = {
  Date: DateScalar,
  Time: TimeScalar,
  DateTime: DateTimeScalar,
  JSON: JsonScalar,
  Query: {
    getOrganizations: async (_: unknown, args: any, ctx: Context) => {
      if (ctx.mongoDb) {
        const query: Record<string, any> = {};
        if (args.username) query.username = args.username;
        const docs = await findMongoOrganizations(ctx.mongoDb, query);
        return docs.map(mapMongoOrganization).filter(Boolean);
      }
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const params: any[] = [];
      const where: string[] = [];
      if (args.username) {
        where.push('username = ?');
        params.push(args.username);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      params.push(limit, offset);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        `SELECT * FROM \`organizations\` ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params
      );
      return rows.map(mapOrganizationRow);
    },
    getOrganization: async (_: unknown, args: any, ctx: Context) => {
      if (ctx.mongoDb) {
        const doc = /^[a-fA-F0-9]{24}$/.test(args.id)
          ? await findMongoOrganizationById(ctx.mongoDb, args.id)
          : await findMongoOrganizationById(ctx.mongoDb, args.id) ?? await findMongoOrganizationByUsername(ctx.mongoDb, args.id);
        return mapMongoOrganization(doc);
      }
      return fetchOrganizationById(ctx.pool, args.id);
    },
    getEvents: async (_: unknown, args: any, ctx: Context) => {
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const params: any[] = [];
      const where: string[] = [];
      if (args.status) {
        where.push('event_status = ?');
        params.push(args.status);
      }
      if (args.fromDate) {
        where.push('event_date >= ?');
        params.push(args.fromDate);
      }
      if (args.toDate) {
        where.push('event_date <= ?');
        params.push(args.toDate);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      params.push(limit, offset);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        `SELECT * FROM \`greenlight-events\` ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params
      );
      return rows.map(mapEventRow);
    },
    getEvent: async (_: unknown, args: any, ctx: Context) => {
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-events` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapEventRow(rows[0]) : null;
    },
    getEventsByOrganization: async (_: unknown, args: any, ctx: Context) => {
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const params: any[] = [args.orgUsername];
      const where: string[] = ['organization = ?'];
      if (args.status) {
        where.push('event_status = ?');
        params.push(args.status);
      }
      if (args.fromDate) {
        where.push('event_date >= ?');
        params.push(args.fromDate);
      }
      if (args.toDate) {
        where.push('event_date <= ?');
        params.push(args.toDate);
      }
      params.push(limit, offset);
      const whereSql = `WHERE ${where.join(' AND ')}`;
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        `SELECT * FROM \`greenlight-events\` ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params
      );
      return rows.map(mapEventRow);
    },
    getUsers: async (_: unknown, args: any, ctx: Context) => {
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const params: any[] = [];
      const where: string[] = [];
      if (args.username) {
        where.push('username = ?');
        params.push(args.username);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      params.push(limit, offset);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        `SELECT * FROM \`greenlight-users\` ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params
      );
      return rows.map(mapUserRow);
    },
    getUser: async (_: unknown, args: any, ctx: Context) => {
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-users` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapUserRow(rows[0]) : null;
    },
    getLocations: async (_: unknown, args: any, ctx: Context) => {
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-locations` ORDER BY id ASC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      return rows.map(mapLocationRow);
    },
    getLocation: async (_: unknown, args: any, ctx: Context) => {
      return fetchLocationById(ctx.pool, args.id);
    },
    getPurchases: async (_: unknown, args: any, ctx: Context) => {
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-purchases` ORDER BY id ASC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      return rows.map(mapPurchaseRow);
    },
    getPurchase: async (_: unknown, args: any, ctx: Context) => {
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-purchases` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapPurchaseRow(rows[0]) : null;
    },
    getPurchasesByOrganization: async (_: unknown, args: any, ctx: Context) => {
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-purchases` WHERE organization = ? ORDER BY id ASC LIMIT ? OFFSET ?',
        [args.orgUsername, limit, offset]
      );
      return rows.map(mapPurchaseRow);
    }
  },
  Mutation: {
    createOrganization: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = organizationInputToDb(args.input || {});
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No input provided');
      const values = columns.map((col) => dbInput[col]);
      const placeholders = columns.map(() => '?').join(',');
      const sql = `INSERT INTO \`organizations\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
      const [result]: any = await ctx.pool.query(sql, values);
      return fetchOrganizationById(ctx.pool, String(result.insertId));
    },
    updateOrganization: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = organizationInputToDb(args.input || {});
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No fields to update');
      const sets = columns.map((col) => `\`${col}\` = ?`).join(',');
      const values = columns.map((col) => dbInput[col]);
      values.push(args.id);
      const sql = `UPDATE \`organizations\` SET ${sets} WHERE id = ?`;
      await ctx.pool.query(sql, values);
      return fetchOrganizationById(ctx.pool, String(args.id));
    },
    deleteOrganization: async (_: unknown, args: any, ctx: Context) => {
      const [result]: any = await ctx.pool.query('DELETE FROM `organizations` WHERE id = ?', [args.id]);
      return result.affectedRows > 0;
    },
    createEvent: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = normalizeEventInput(eventInputToDb(args.input || {}));
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No input provided');
      const values = columns.map((col) => dbInput[col]);
      const placeholders = columns.map(() => '?').join(',');
      const sql = `INSERT INTO \`greenlight-events\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
      const [result]: any = await ctx.pool.query(sql, values);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-events` WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      return rows[0] ? mapEventRow(rows[0]) : null;
    },
    updateEvent: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = normalizeEventInput(eventInputToDb(args.input || {}));
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No fields to update');
      const sets = columns.map((col) => `\`${col}\` = ?`).join(',');
      const values = columns.map((col) => dbInput[col]);
      values.push(args.id);
      const sql = `UPDATE \`greenlight-events\` SET ${sets} WHERE id = ?`;
      await ctx.pool.query(sql, values);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-events` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapEventRow(rows[0]) : null;
    },
    deleteEvent: async (_: unknown, args: any, ctx: Context) => {
      const [result]: any = await ctx.pool.query('DELETE FROM `greenlight-events` WHERE id = ?', [args.id]);
      return result.affectedRows > 0;
    },
    changeEventStatus: async (_: unknown, args: any, ctx: Context) => {
      const status = normalizeEventStatus(args.status);
      await ctx.pool.query('UPDATE `greenlight-events` SET `event_status` = ? WHERE id = ?', [status, args.id]);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-events` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapEventRow(rows[0]) : null;
    },
    createUser: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = userInputToDb(args.input || {});
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No input provided');
      const values = columns.map((col) => dbInput[col]);
      const placeholders = columns.map(() => '?').join(',');
      const sql = `INSERT INTO \`greenlight-users\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
      const [result]: any = await ctx.pool.query(sql, values);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-users` WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      return rows[0] ? mapUserRow(rows[0]) : null;
    },
    updateUser: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = userInputToDb(args.input || {});
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No fields to update');
      const sets = columns.map((col) => `\`${col}\` = ?`).join(',');
      const values = columns.map((col) => dbInput[col]);
      values.push(args.id);
      const sql = `UPDATE \`greenlight-users\` SET ${sets} WHERE id = ?`;
      await ctx.pool.query(sql, values);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-users` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapUserRow(rows[0]) : null;
    },
    deleteUser: async (_: unknown, args: any, ctx: Context) => {
      const [result]: any = await ctx.pool.query('DELETE FROM `greenlight-users` WHERE id = ?', [args.id]);
      return result.affectedRows > 0;
    },
    createPurchase: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = normalizePurchaseInput(purchaseInputToDb(args.input || {}));
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No input provided');
      const values = columns.map((col) => dbInput[col]);
      const placeholders = columns.map(() => '?').join(',');
      const sql = `INSERT INTO \`greenlight-purchases\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
      const [result]: any = await ctx.pool.query(sql, values);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-purchases` WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      return rows[0] ? mapPurchaseRow(rows[0]) : null;
    },
    updatePurchase: async (_: unknown, args: any, ctx: Context) => {
      const dbInput = normalizePurchaseInput(purchaseInputToDb(args.input || {}));
      const columns = Object.keys(dbInput);
      if (columns.length === 0) throw new Error('No fields to update');
      const sets = columns.map((col) => `\`${col}\` = ?`).join(',');
      const values = columns.map((col) => dbInput[col]);
      values.push(args.id);
      const sql = `UPDATE \`greenlight-purchases\` SET ${sets} WHERE id = ?`;
      await ctx.pool.query(sql, values);
      const [rows] = await ctx.pool.query<RowDataPacket[]>(
        'SELECT * FROM `greenlight-purchases` WHERE id = ? LIMIT 1',
        [args.id]
      );
      return rows[0] ? mapPurchaseRow(rows[0]) : null;
    },
    deletePurchase: async (_: unknown, args: any, ctx: Context) => {
      const [result]: any = await ctx.pool.query('DELETE FROM `greenlight-purchases` WHERE id = ?', [args.id]);
      return result.affectedRows > 0;
    }
  },
  Organization: {
    events: async (parent: any, args: any, ctx: Context) => {
      const username = parent.username || parent.organizationUsername;
      const limit = Number(args.limit ?? 25);
      const offset = Number(args.offset ?? 0);
      const params: any[] = [username];
      const where: string[] = ['organization = ?'];
      if (args.status) {
        where.push('event_status = ?');
        params.push(args.status);
      }
      if (args.fromDate) {
        where.push('event_date >= ?');
        params.push(args.fromDate);
      }
      if (args.toDate) {
        where.push('event_date <= ?');
        params.push(args.toDate);
      }
      params.push(limit, offset);
      const [rows] = await ctx.pool.query<DbRow[]>(
        `SELECT * FROM \`greenlight-events\` WHERE ${where.join(' AND ')} ORDER BY id ASC LIMIT ? OFFSET ?`,
        params
      );
      return rows.map(mapEventRow);
    }
  },
  Event: {
    organization: async (parent: any, _args: any, ctx: Context) => {
      return fetchOrganizationByUsername(ctx.pool, parent.organizationUsername || parent.organization);
    }
  },
  User: {
    organization: async (parent: any, _args: any, ctx: Context) => {
      return fetchOrganizationByUsername(ctx.pool, parent.organizationUsername || parent.organization);
    }
  },
  Purchase: {
    organization: async (parent: any, _args: any, ctx: Context) => {
      return fetchOrganizationByUsername(ctx.pool, parent.organizationUsername || parent.organization);
    }
  }
};
