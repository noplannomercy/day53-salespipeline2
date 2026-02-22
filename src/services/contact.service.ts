'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type {
  Contact,
  ContactFilters,
  ContactWithRelations,
  Company,
  Deal,
  Activity,
  Note,
  Email,
  EntityTag,
  Tag,
  Attachment,
} from '@/types/index';

const KEY = STORAGE_KEYS.CONTACTS;

/**
 * Retrieve all contacts, optionally filtered.
 */
export function getContacts(filters?: ContactFilters): Contact[] {
  let items = storage.getAll<Contact>(KEY);

  if (filters?.companyId) {
    items = items.filter((c) => c.companyId === filters.companyId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }
  if (filters?.tagId) {
    const entityTags = storage.getAll<EntityTag>(STORAGE_KEYS.ENTITY_TAGS);
    const contactIdsWithTag = new Set(
      entityTags
        .filter((et) => et.entityType === 'contact' && et.tagId === filters.tagId)
        .map((et) => et.entityId),
    );
    items = items.filter((c) => contactIdsWithTag.has(c.id));
  }

  return items;
}

/**
 * Retrieve a single contact with related entities (company, deals, activities, notes, emails).
 */
export function getContactById(id: string): ContactWithRelations | null {
  const contact = storage.getById<Contact>(KEY, id);
  if (!contact) return null;

  const company = contact.companyId
    ? storage.getById<Company>(STORAGE_KEYS.COMPANIES, contact.companyId)
    : null;

  const deals = storage
    .getAll<Deal>(STORAGE_KEYS.DEALS)
    .filter((d) => d.contactId === id);

  const activities = storage
    .getAll<Activity>(STORAGE_KEYS.ACTIVITIES)
    .filter((a) => a.contactId === id);

  const notes = storage
    .getAll<Note>(STORAGE_KEYS.NOTES)
    .filter((n) => n.contactId === id);

  const emails = storage
    .getAll<Email>(STORAGE_KEYS.EMAILS)
    .filter((e) => e.contactId === id);

  return {
    ...contact,
    company,
    deals,
    activities,
    notes,
    emails,
  };
}

/**
 * Create a new contact. The id, createdAt, updatedAt fields are auto-generated.
 */
export function createContact(
  data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>,
): Contact {
  return storage.create<Contact>(KEY, data);
}

/**
 * Partially update an existing contact.
 */
export function updateContact(
  id: string,
  data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>,
): Contact | null {
  return storage.update<Contact>(KEY, id, data);
}

/**
 * Delete a contact by ID.
 * Cascades: removes associated entity tags, leads, activities, notes, and emails
 * that reference this contact.
 */
export function deleteContact(id: string): void {
  // Clean up entity tags for this contact
  const entityTags = storage.getAll<EntityTag>(STORAGE_KEYS.ENTITY_TAGS);
  const remainingTags = entityTags.filter(
    (et) => !(et.entityType === 'contact' && et.entityId === id),
  );
  if (remainingTags.length !== entityTags.length) {
    storage.save(STORAGE_KEYS.ENTITY_TAGS, remainingTags);
  }

  // Clean up leads referencing this contact
  const leads = storage.getAll<{ id: string; contactId: string }>(STORAGE_KEYS.LEADS);
  const remainingLeads = leads.filter((l) => l.contactId !== id);
  if (remainingLeads.length !== leads.length) {
    storage.save(STORAGE_KEYS.LEADS, remainingLeads);
  }

  // Clean up activities referencing this contact
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  const remainingActivities = activities.filter((a) => a.contactId !== id);
  if (remainingActivities.length !== activities.length) {
    storage.save(STORAGE_KEYS.ACTIVITIES, remainingActivities);
  }

  // Clean up notes referencing this contact
  const notes = storage.getAll<Note>(STORAGE_KEYS.NOTES);
  const remainingNotes = notes.filter((n) => n.contactId !== id);
  if (remainingNotes.length !== notes.length) {
    storage.save(STORAGE_KEYS.NOTES, remainingNotes);
  }

  // Clean up emails referencing this contact
  const emails = storage.getAll<Email>(STORAGE_KEYS.EMAILS);
  const remainingEmails = emails.filter((e) => e.contactId !== id);
  if (remainingEmails.length !== emails.length) {
    storage.save(STORAGE_KEYS.EMAILS, remainingEmails);
  }

  // Clean up attachments for this contact
  const attachments = storage.getAll<Attachment>(STORAGE_KEYS.ATTACHMENTS);
  const remainingAttachments = attachments.filter(
    (a) => !(a.entityType === 'contact' && a.entityId === id),
  );
  if (remainingAttachments.length !== attachments.length) {
    storage.save(STORAGE_KEYS.ATTACHMENTS, remainingAttachments);
  }

  storage.remove(KEY, id);
}

/**
 * Get tags associated with a contact.
 */
export function getContactTags(contactId: string): Tag[] {
  const entityTags = storage.getAll<EntityTag>(STORAGE_KEYS.ENTITY_TAGS);
  const tagIds = entityTags
    .filter((et) => et.entityType === 'contact' && et.entityId === contactId)
    .map((et) => et.tagId);

  if (tagIds.length === 0) return [];

  const tags = storage.getAll<Tag>(STORAGE_KEYS.TAGS);
  const tagIdSet = new Set(tagIds);
  return tags.filter((t) => tagIdSet.has(t.id));
}

/**
 * Count deals associated with a contact.
 */
export function getContactDealCount(contactId: string): number {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  return deals.filter((d) => d.contactId === contactId).length;
}

/**
 * Get the company name for a contact (used in table display).
 */
export function getContactCompanyName(companyId: string | null): string {
  if (!companyId) return '-';
  const company = storage.getById<Company>(STORAGE_KEYS.COMPANIES, companyId);
  return company?.name ?? '-';
}

/**
 * Find contacts whose email or phone matches the given values.
 * Useful for duplicate detection in ContactForm.
 * When currentId is provided the contact with that ID is excluded from results
 * (so the form doesn't flag the record being edited as a duplicate).
 */
export function findDuplicates(
  email: string,
  phone: string,
  currentId?: string,
): Contact[] {
  const normalEmail = email.trim().toLowerCase();
  const normalPhone = phone.trim();

  if (!normalEmail && !normalPhone) return [];

  const all = storage.getAll<Contact>(KEY);
  return all.filter((c) => {
    if (currentId && c.id === currentId) return false;

    if (normalEmail && c.email.toLowerCase() === normalEmail) return true;
    if (normalPhone && c.phone && c.phone === normalPhone) return true;

    return false;
  });
}
