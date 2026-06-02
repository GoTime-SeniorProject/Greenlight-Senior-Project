import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DbRow, mapOrganizationRow, mapLocationRow } from '../db/mappers.js';

export async function fetchOrganizationByUsername(pool: Pool, username: string | null) {
  if (!username) return null;
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM `organizations` WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] ? mapOrganizationRow(rows[0]) : null;
}

export async function fetchOrganizationById(pool: Pool, id: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM `organizations` WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? mapOrganizationRow(rows[0]) : null;
}

export async function fetchLocationById(pool: Pool, id: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM `locations` WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? mapLocationRow(rows[0]) : null;
}

export function normalizeEventInput(input: DbRow): DbRow {
  const out: DbRow = { ...input };
  if (Object.prototype.hasOwnProperty.call(out, 'event_level')) {
    out.event_level = out.event_level !== null && out.event_level !== undefined ? Number(out.event_level) : null;
  }
  if (Object.prototype.hasOwnProperty.call(out, 'location_type')) {
    out.location_type = normalizeLocationType(out.location_type);
  }
  if (Object.prototype.hasOwnProperty.call(out, 'event_status')) {
    out.event_status = normalizeEventStatus(out.event_status);
  }
  if (Object.prototype.hasOwnProperty.call(out, 'form_data')) {
    const raw = out.form_data;
    if (raw && typeof raw === 'object') {
      out.form_data = JSON.stringify(raw);
    }
  }
  return out;
}

export function normalizePurchaseInput(input: DbRow): DbRow {
  const out: DbRow = { ...input };
  if (Object.prototype.hasOwnProperty.call(out, 'item_cost')) {
    out.item_cost = out.item_cost !== null && out.item_cost !== undefined ? Number(out.item_cost) : null;
  }
  return out;
}

export function normalizeLocationType(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).toUpperCase().replace(/[-\s]/g, '_');
  if (normalized === 'ON_CAMPUS' || normalized === 'OFF_CAMPUS' || normalized === 'VIRTUAL') {
    return normalized;
  }
  return null;
}

export function normalizeEventStatus(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value).toUpperCase();
}