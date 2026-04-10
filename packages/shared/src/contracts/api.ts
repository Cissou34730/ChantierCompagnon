import type { JournalDay, Site } from '../types/domain.js';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface CreateSiteRequest {
  code: string;
  name: string;
  address: string;
  clientName: string;
  latitude?: number | null;
  longitude?: number | null;
  startDate: string;
  expectedEndDate?: string | null;
}

export interface GetSitesResponse {
  items: Site[];
}

export interface GetSiteResponse {
  item: Site;
}

export interface CreateSiteResponse {
  item: Site;
}

export interface GetJournalDayResponse {
  item: JournalDay;
}
