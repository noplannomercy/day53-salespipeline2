'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type {
  Lead,
  LeadFilters,
  LeadWithRelations,
  Contact,
  Member,
  Deal,
  Stage,
} from '@/types/index';

const KEY = STORAGE_KEYS.LEADS;

/**
 * Retrieve all leads, optionally filtered.
 */
export function getLeads(filters?: LeadFilters): Lead[] {
  let items = storage.getAll<Lead>(KEY);

  if (filters?.source) {
    items = items.filter((l) => l.source === filters.source);
  }
  if (filters?.status) {
    items = items.filter((l) => l.status === filters.status);
  }
  if (filters?.assignedTo) {
    items = items.filter((l) => l.assignedTo === filters.assignedTo);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    // Search by contact name — load contacts for name lookup
    const contacts = storage.getAll<Contact>(STORAGE_KEYS.CONTACTS);
    const contactMap = new Map(contacts.map((c) => [c.id, c]));
    items = items.filter((l) => {
      const contact = contactMap.get(l.contactId);
      return contact?.name.toLowerCase().includes(q);
    });
  }
  if (filters?.scoreMin !== undefined) {
    items = items.filter((l) => l.score >= filters.scoreMin!);
  }
  if (filters?.scoreMax !== undefined) {
    items = items.filter((l) => l.score <= filters.scoreMax!);
  }

  return items;
}

/**
 * Retrieve a single lead by ID. Returns null when not found.
 */
export function getLeadById(id: string): LeadWithRelations | null {
  const lead = storage.getById<Lead>(KEY, id);
  if (!lead) return null;

  const contact = storage.getById<Contact>(
    STORAGE_KEYS.CONTACTS,
    lead.contactId,
  );
  const assignedMember = lead.assignedTo
    ? storage.getById<Member>(STORAGE_KEYS.MEMBERS, lead.assignedTo)
    : null;

  return {
    ...lead,
    contact,
    assignedMember,
  };
}

/**
 * Create a new lead. The id, createdAt, updatedAt fields are auto-generated.
 */
export function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
): Lead {
  return storage.create<Lead>(KEY, data);
}

/**
 * Partially update an existing lead.
 */
export function updateLead(
  id: string,
  data: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>,
): Lead | null {
  return storage.update<Lead>(KEY, id, data);
}

/**
 * Delete a lead by ID.
 */
export function deleteLead(id: string): void {
  storage.remove(KEY, id);
}

/**
 * Convert a qualified lead into a new deal.
 *
 * Steps:
 * 1. Creates a Deal with the lead's contact/company info
 * 2. Updates the lead status and records the conversion
 *
 * @param dealTitle - Custom title for the new deal. Falls back to "[contact name] - Lead Conversion".
 * Returns the newly created Deal.
 */
export function convertLeadToDeal(
  leadId: string,
  pipelineId: string,
  stageId: string,
  dealTitle?: string,
): Deal | null {
  const lead = storage.getById<Lead>(KEY, leadId);
  if (!lead) return null;

  const contact = storage.getById<Contact>(
    STORAGE_KEYS.CONTACTS,
    lead.contactId,
  );

  const title = dealTitle?.trim() || `${contact?.name ?? 'Unknown'} - Lead Conversion`;

  // Create the deal via storage.ts directly (no deal.service dependency)
  const deal = storage.create<Deal>(STORAGE_KEYS.DEALS, {
    pipelineId,
    stageId,
    contactId: lead.contactId,
    companyId: contact?.companyId ?? null,
    title,
    value: 0,
    currency: 'KRW',
    expectedCloseDate: null,
    priority: 'medium',
    status: 'open',
    lostReason: '',
    assignedTo: lead.assignedTo,
  });

  // Mark the lead as converted
  storage.update<Lead>(KEY, leadId, {
    status: 'qualified',
  } as Partial<Lead>);

  return deal;
}

/**
 * Get the contact name for a lead (used in table display).
 */
export function getLeadContactName(contactId: string): string {
  const contact = storage.getById<Contact>(STORAGE_KEYS.CONTACTS, contactId);
  return contact?.name ?? '-';
}

/**
 * Get the assigned member name for a lead (used in table display).
 */
export function getLeadMemberName(memberId: string): string {
  const member = storage.getById<Member>(STORAGE_KEYS.MEMBERS, memberId);
  return member?.name ?? '-';
}

/**
 * Get all stages for a given pipeline (used in ConvertDialog).
 */
export function getStagesByPipeline(pipelineId: string): Stage[] {
  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  return stages
    .filter((s) => s.pipelineId === pipelineId)
    .sort((a, b) => a.order - b.order);
}
