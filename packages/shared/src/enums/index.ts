export const SITE_STATUSES = ['active', 'suspended', 'completed'] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export const ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'late',
  'left_early',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const WEATHER_PERIODS = ['morning', 'afternoon'] as const;
export type WeatherPeriod = (typeof WEATHER_PERIODS)[number];

export const WEATHER_CONDITIONS = [
  'sunny',
  'cloudy',
  'rain',
  'snow',
  'frost',
  'fog',
  'storm',
] as const;
export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

export const WEATHER_IMPACTS = ['favorable', 'unfavorable'] as const;
export type WeatherImpact = (typeof WEATHER_IMPACTS)[number];

export const PRECIPITATION_INTENSITIES = ['low', 'moderate', 'high'] as const;
export type PrecipitationIntensity = (typeof PRECIPITATION_INTENSITIES)[number];

export const SAFETY_SEVERITIES = ['low', 'moderate', 'high', 'critical'] as const;
export type SafetySeverity = (typeof SAFETY_SEVERITIES)[number];

export const SAFETY_CATEGORIES = [
  'fall_from_height',
  'slip_trip_fall',
  'falling_object',
  'electrical',
  'crush_or_entrapment',
  'chemical',
  'fire',
  'other',
] as const;
export type SafetyCategory = (typeof SAFETY_CATEGORIES)[number];

export const PHOTO_CATEGORIES = [
  'anomaly',
  'progress',
  'safety',
  'delivery',
  'other',
] as const;
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

export const REPORT_STATUSES = [
  'draft',
  'pending_validation',
  'validated',
  'sent',
  'send_error',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const INPUT_SOURCES = ['manual', 'voice', 'automatic'] as const;
export type InputSource = (typeof INPUT_SOURCES)[number];

export const TIMELINE_EVENT_TYPES = [
  'attendance',
  'weather',
  'safety',
  'photo',
  'note',
] as const;
export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export const TIMELINE_IMPORTANCES = ['normal', 'important', 'critical'] as const;
export type TimelineImportance = (typeof TIMELINE_IMPORTANCES)[number];

export const PHOTO_LINKED_ENTITY_TYPES = [
  'safety',
  'attendance',
  'weather',
  'note',
] as const;
export type PhotoLinkedEntityType = (typeof PHOTO_LINKED_ENTITY_TYPES)[number];

export const WEATHER_SOURCES = ['manual', 'automatic'] as const;
export type WeatherSource = (typeof WEATHER_SOURCES)[number];
