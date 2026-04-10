import type {
  AttendanceStatus,
  InputSource,
  PhotoCategory,
  PhotoLinkedEntityType,
  ReportStatus,
  SafetyCategory,
  SafetySeverity,
  SiteStatus,
  TimelineEventType,
  TimelineImportance,
  WeatherCondition,
  WeatherImpact,
  WeatherPeriod,
  WeatherSource,
  PrecipitationIntensity,
} from '../enums/index.js';

export interface Site {
  id: string;
  code: string;
  name: string;
  address: string;
  clientName: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  expectedEndDate: string | null;
  status: SiteStatus;
  createdAt: string;
}

export interface JournalDay {
  id: string;
  siteId: string;
  date: string;
  reportStatus: ReportStatus;
  generalObservations: string | null;
  createdAt: string;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  employeeCode: string | null;
  primaryQualification: string | null;
  createdAt: string;
}

export interface AttendanceEntry {
  id: string;
  journalDayId: string;
  workerId: string;
  arrivalTime: string | null;
  departureTime: string | null;
  status: AttendanceStatus;
  assignedTask: string | null;
  comment: string | null;
  inputSource: InputSource;
  createdAt: string;
}

export interface WeatherEntry {
  id: string;
  journalDayId: string;
  period: WeatherPeriod;
  recordedAtTime: string;
  temperatureCelsius: number;
  windKmh: number | null;
  condition: WeatherCondition;
  precipitationType: string | null;
  precipitationIntensity: PrecipitationIntensity | null;
  impact: WeatherImpact;
  impactComment: string | null;
  source: WeatherSource;
  createdAt: string;
}

export interface SafetyIncident {
  id: string;
  journalDayId: string;
  occurredAt: string;
  location: string;
  description: string;
  category: SafetyCategory;
  potentialSeverity: SafetySeverity;
  involvedPeople: string | null;
  witnesses: string | null;
  immediateActions: string | null;
  plannedActions: string | null;
  actionOwner: string | null;
  actionDueDate: string | null;
  inputSource: InputSource;
  createdAt: string;
}

export interface PhotoRecord {
  id: string;
  journalDayId: string;
  filePath: string;
  originalFileName: string;
  mimeType: string;
  capturedAt: string;
  category: PhotoCategory;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  linkedEntityId: string | null;
  linkedEntityType: PhotoLinkedEntityType | null;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  journalDayId: string;
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  preview: string;
  importance: TimelineImportance;
  hasPhotos: boolean;
  inputSource: InputSource;
  photoThumbnailUrl?: string | null;
  linkedEntityId: string;
}

export interface DailyReport {
  id: string;
  journalDayId: string;
  status: ReportStatus;
  generatedAt: string;
  contentMarkdown: string;
}

export interface SafetyDetectionMetadata {
  safetyAlert: boolean;
  matchedKeywords: string[];
}
