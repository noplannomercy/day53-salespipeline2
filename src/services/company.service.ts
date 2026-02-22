import { STORAGE_KEYS } from '@/types/index';
import type {
  Company,
  CompanyWithRelations,
  CompanyFilters,
  Contact,
  Deal,
  Note,
  Attachment,
} from '@/types/index';
import * as storage from '@/lib/storage';

/**
 * Retrieve all companies, optionally filtered by industry, size, or search term.
 */
export function getCompanies(filters?: CompanyFilters): Company[] {
  let companies = storage.getAll<Company>(STORAGE_KEYS.COMPANIES);

  if (filters?.industry) {
    companies = companies.filter((c) => c.industry === filters.industry);
  }
  if (filters?.size) {
    companies = companies.filter((c) => c.size === filters.size);
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    companies = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.industry.toLowerCase().includes(term) ||
        c.website.toLowerCase().includes(term),
    );
  }

  return companies;
}

/**
 * Retrieve a single company by ID with related contacts, deals, and notes.
 */
export function getCompanyById(id: string): CompanyWithRelations | null {
  const company = storage.getById<Company>(STORAGE_KEYS.COMPANIES, id);
  if (!company) return null;

  const contacts = storage
    .getAll<Contact>(STORAGE_KEYS.CONTACTS)
    .filter((c) => c.companyId === id);

  const deals = storage
    .getAll<Deal>(STORAGE_KEYS.DEALS)
    .filter((d) => d.companyId === id);

  const notes = storage
    .getAll<Note>(STORAGE_KEYS.NOTES)
    .filter((n) => n.companyId === id);

  return { ...company, contacts, deals, notes };
}

/**
 * Create a new company.
 */
export function createCompany(
  data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
): Company {
  return storage.create<Company>(STORAGE_KEYS.COMPANIES, data);
}

/**
 * Partially update an existing company.
 */
export function updateCompany(
  id: string,
  data: Partial<Omit<Company, 'id' | 'createdAt'>>,
): Company | null {
  return storage.update<Company>(STORAGE_KEYS.COMPANIES, id, data);
}

/**
 * Delete a company and clear the companyId FK on related contacts and deals.
 */
export function deleteCompany(id: string): void {
  // Clear companyId on related contacts
  const contacts = storage.getAll<Contact>(STORAGE_KEYS.CONTACTS);
  const updatedContacts = contacts.map((c) =>
    c.companyId === id ? { ...c, companyId: null } : c,
  );
  storage.save(STORAGE_KEYS.CONTACTS, updatedContacts);

  // Clear companyId on related deals
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const updatedDeals = deals.map((d) =>
    d.companyId === id ? { ...d, companyId: null } : d,
  );
  storage.save(STORAGE_KEYS.DEALS, updatedDeals);

  // Remove associated notes
  const notes = storage.getAll<Note>(STORAGE_KEYS.NOTES);
  storage.save(
    STORAGE_KEYS.NOTES,
    notes.filter((n) => n.companyId !== id),
  );

  // Remove attachments for this company
  const attachments = storage.getAll<Attachment>(STORAGE_KEYS.ATTACHMENTS);
  const remainingAttachments = attachments.filter(
    (a) => !(a.entityType === 'company' && a.entityId === id),
  );
  if (remainingAttachments.length !== attachments.length) {
    storage.save(STORAGE_KEYS.ATTACHMENTS, remainingAttachments);
  }

  storage.remove(STORAGE_KEYS.COMPANIES, id);
}

/**
 * Get distinct industries from all companies, for filter dropdowns.
 */
export function getDistinctIndustries(): string[] {
  const companies = storage.getAll<Company>(STORAGE_KEYS.COMPANIES);
  const industries = new Set(companies.map((c) => c.industry).filter(Boolean));
  return Array.from(industries).sort();
}
