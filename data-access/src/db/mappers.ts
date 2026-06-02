import type { RowDataPacket } from 'mysql2/promise';

export type DbRow = RowDataPacket & Record<string, any>;

const EVENT_MAP: Record<string, string> = {
  organizationUsername: 'organization',
  createdBy: 'created_by',
  title: 'title',
  description: 'description',
  eventDate: 'event_date',
  setupTime: 'setup_time',
  startTime: 'start_time',
  endTime: 'end_time',
  location: 'location',
  locationId: 'location_id',
  locationType: 'location_type',
  eventLevel: 'event_level',
  eventImg: 'event_img',
  eventStatus: 'event_status',
  formData: 'form_data',
  submittedAt: 'submitted_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const ORG_MAP: Record<string, string> = {
  orgName: 'org_name',
  username: 'username',
  bio: 'bio',
  orgImg: 'org_img',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const USER_MAP: Record<string, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  username: 'username',
  password: 'password',
  profileImg: 'profile_img',
  role: 'role',
  organizationUsername: 'organization',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const PURCHASE_MAP: Record<string, string> = {
  organizationUsername: 'organization',
  dateSubmitted: 'date_submitted',
  itemTitle: 'item_title',
  itemCategory: 'item_category',
  eventId: 'event_id',
  orderStatus: 'order_status',
  itemCost: 'item_cost'
};

export function mapEventRow(row: DbRow): DbRow {
  return mapRow(row, EVENT_MAP, 'Event');
}

export function mapOrganizationRow(row: DbRow): DbRow {
  return mapRow(row, ORG_MAP, 'Organization');
}

export function mapUserRow(row: DbRow): DbRow {
  return mapRow(row, USER_MAP, 'User');
}

export function mapPurchaseRow(row: DbRow): DbRow {
  return mapRow(row, PURCHASE_MAP, 'Purchase');
}

export function mapLocationRow(row: DbRow): DbRow {
  return mapRow(row, {}, 'Location');
}

export function eventInputToDb(input: DbRow): DbRow {
  return mapInputToDb(input, EVENT_MAP);
}

export function organizationInputToDb(input: DbRow): DbRow {
  return mapInputToDb(input, ORG_MAP);
}

export function userInputToDb(input: DbRow): DbRow {
  return mapInputToDb(input, USER_MAP);
}

export function purchaseInputToDb(input: DbRow): DbRow {
  return mapInputToDb(input, PURCHASE_MAP);
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

function mapInputToDb(input: DbRow, mapping: Record<string, string>): DbRow {
  const out = {} as DbRow;
  for (const [key, value] of Object.entries(input)) {
    const column = mapping[key];
    if (column) {
      out[column] = value;
    }
  }
  return out;
}

function mapRow(row: DbRow, mapping: Record<string, string>, type: string): DbRow {
  if (!row) return row;
  const out: DbRow = { ...row };
  for (const [gqlKey, dbKey] of Object.entries(mapping)) {
    if (Object.prototype.hasOwnProperty.call(row, dbKey)) {
      out[gqlKey] = row[dbKey];
    }
  }

  if (type === 'Event') {
    if (Object.prototype.hasOwnProperty.call(out, 'locationType')) {
      out.locationType = normalizeLocationType(out.locationType);
    }
    if (Object.prototype.hasOwnProperty.call(out, 'eventStatus')) {
      out.eventStatus = normalizeEventStatus(out.eventStatus);
    }
    if (Object.prototype.hasOwnProperty.call(out, 'formData')) {
      const raw = out.formData;
      if (raw === null || raw === undefined) {
        out.formData = null;
      } else if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) {
          out.formData = null;
        } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            out.formData = JSON.parse(trimmed);
          } catch {
            out.formData = raw;
          }
        }
      }
    }
  }

  return out;
}
