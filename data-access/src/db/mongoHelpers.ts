import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

/* ─────────────────────────────
    COLLECTION HELPERS
───────────────────────────── */

export function organizationCollections(db: Db) {
    return [
        db.collection('organizations'),
        db.collection('greenlight-orgs'),
        db.collection('orgs')
    ];
}

export function userCollections(db: Db) {
    return [
        db.collection('users'),
        db.collection('greenlight-users')
    ];
}

export function eventCollections(db: Db) {
    return [
        db.collection('events'),
        db.collection('greenlight-events')
    ];
}

export function locationCollections(db: Db) {
    return [
        db.collection('locations'),
        db.collection('greenlight-locations')
    ];
}

export function purchaseCollections(db: Db) {
    return [
        db.collection('purchases'),
        db.collection('greenlight-purchases')
    ];
}

/* ─────────────────────────────
    GENERIC FIND HELPERS
───────────────────────────── */

export async function findMongoDocuments(
    collections: any[],
    query: Record<string, any>
    ) {
    const docs = await Promise.all(
        collections.map((collection) =>
        collection.find(query).sort({ id: 1 }).toArray()
        )
    );

    return docs.flat();
}

export async function findMongoOrganizations(db: Db, query: Record<string, any>) {
    return findMongoDocuments(organizationCollections(db), query);
}

export async function findMongoEvents(db: Db, query: Record<string, any>) {
    return findMongoDocuments(eventCollections(db), query);
}

/* ─────────────────────────────
    SINGLE DOCUMENT LOOKUPS
───────────────────────────── */

export async function findMongoOrganizationByUsername(db: Db, username: string) {
    for (const col of organizationCollections(db)) {
        const doc = await col.findOne({ username });
        if (doc) return doc;
    }
    return null;
}

export async function findMongoOrganizationById(db: Db, id: string) {
    const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    for (const col of organizationCollections(db)) {
        if (objectId) {
        const byObjectId = await col.findOne({ _id: objectId });
        if (byObjectId) return byObjectId;
        }

        const byString = await col.findOne({ id });
        if (byString) return byString;
    }

    return null;
}

export async function findMongoEventById(db: Db, id: string) {
    const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    for (const col of eventCollections(db)) {
        if (objectId) {
        const byObjectId = await col.findOne({ _id: objectId });
        if (byObjectId) return byObjectId;
        }

        const byString = await col.findOne({ id });
        if (byString) return byString;
    }

    return null;
}

/* ─────────────────────────────
    MAPPERS (MONGO ONLY)
───────────────────────────── */

export function mapMongoOrganization(doc: any) {
    if (!doc) return null;

    return {
        _id: String(doc._id),
        id: String(doc.id ?? doc._id),
        orgName: doc.org_name ?? doc.orgName ?? null,
        username: doc.username ?? null,
        bio: doc.bio ?? null,
        orgImg: doc.org_img ?? doc.orgImg ?? null,
        createdAt: doc.created_at ?? doc.createdAt ?? null,
        updatedAt: doc.updated_at ?? doc.updatedAt ?? null
    };
}

export function mapMongoEvent(doc: any) {
    if (!doc) return null;

    return {
        _id: String(doc._id),
        id: String(doc.id ?? doc._id),
        organizationUsername:
        doc.organizationUsername ?? doc.organization_username ?? doc.organization ?? null,
        organization: doc.organizationId ?? doc.organization_id ?? doc.organization ?? null,
        createdBy: doc.created_by ?? doc.createdBy ?? null,
        title: doc.title ?? null,
        description: doc.description ?? null,
        eventDate: doc.event_date ?? doc.eventDate ?? null,
        setupTime: doc.setup_time ?? doc.setupTime ?? null,
        startTime: doc.start_time ?? doc.startTime ?? null,
        endTime: doc.end_time ?? doc.endTime ?? null,
        location: doc.location ?? null,
        locationId: doc.locationId ?? doc.location_id ?? null,
        locationType: doc.locationType ?? doc.location_type ?? null,
        eventLevel: doc.eventLevel ?? doc.event_level ?? null,
        eventImg: doc.eventImg ?? doc.event_img ?? null,
        eventStatus: doc.eventStatus ?? doc.event_status ?? null,
        formData: doc.formData ?? doc.form_data ?? null,
        submittedAt: doc.submitted_at ?? doc.submittedAt ?? null,
        createdAt: doc.created_at ?? doc.createdAt ?? null,
        updatedAt: doc.updated_at ?? doc.updatedAt ?? null
    };
}

/* ─────────────────────────────
    OBJECT ID HELPERS
───────────────────────────── */

export function asObjectId(value: any) {
    if (value instanceof ObjectId) return value;
    if (typeof value === 'string' && ObjectId.isValid(value)) {
        return new ObjectId(value);
    }
    return null;
}

/* ─────────────────────────────
    RELATION QUERY BUILDER
───────────────────────────── */

export function relationQueryFromParent(parent: any, fieldNames: string[]) {
    for (const fieldName of fieldNames) {
        const value = parent?.[fieldName];
        if (value === null || value === undefined) continue;

        const objectId = asObjectId(value);

        if (objectId) {
        return {
            $or: [
            { [fieldName]: objectId },
            { [fieldName]: String(value) }
            ]
        };
        }

        return {
        $or: [
            { [fieldName]: value },
            { [fieldName]: String(value) }
        ]
        };
    }

    return {};
}

/* ─────────────────────────────
    OPTIONAL: NORMALIZATION (MONGO SAFE ONLY)
───────────────────────────── */

export function normalizeEventStatus(value: unknown): string | null {
    if (value == null) return null;
    return String(value).toUpperCase();
}

export function normalizeLocationType(value: unknown): string | null {
    if (value == null) return null;

    const normalized = String(value).toUpperCase().replace(/[-\s]/g, '_');

    if (
        normalized === 'ON_CAMPUS' ||
        normalized === 'OFF_CAMPUS' ||
        normalized === 'VIRTUAL'
    ) {
        return normalized;
    }

    return null;
}