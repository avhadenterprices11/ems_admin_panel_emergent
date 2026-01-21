// Mock data
export const MOCK_USERS = [
  { id: 'user_1', name: 'Sarah Jenkins', role: 'Event Manager' },
  { id: 'user_2', name: 'Michael Chen', role: 'Marketing Lead' },
  { id: 'user_3', name: 'Emma Davis', role: 'Operations' },
];

export const MOCK_VENUES = [
  { id: 'ven_1', name: 'ExCeL London', address: 'Royal Victoria Dock', city: 'London', state: '', zip: 'E16 1XL', country: 'UK' },
  { id: 'ven_2', name: 'Moscone Center', address: '747 Howard St', city: 'San Francisco', state: 'CA', zip: '94103', country: 'USA' },
];

export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
  { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
  { value: 'America/Anchorage', label: 'Alaska Time - Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time - Honolulu' },
  { value: 'America/Toronto', label: 'Eastern Time - Toronto' },
  { value: 'America/Vancouver', label: 'Pacific Time - Vancouver' },
  { value: 'America/Sao_Paulo', label: 'Brazil Time - São Paulo' },
  { value: 'America/Mexico_City', label: 'Central Time - Mexico City' },
  // Europe
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
  { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET) - Berlin' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (CET) - Amsterdam' },
  { value: 'Europe/Rome', label: 'Central European Time (CET) - Rome' },
  { value: 'Europe/Madrid', label: 'Central European Time (CET) - Madrid' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK) - Moscow' },
  // Asia
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Mumbai/Delhi' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT) - Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT) - Hong Kong' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST) - Shanghai' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (KST) - Seoul' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time (WIB) - Jakarta' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (ICT) - Bangkok' },
  // Oceania
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET) - Sydney' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AET) - Melbourne' },
  { value: 'Australia/Perth', label: 'Australian Western Time (AWT) - Perth' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT) - Auckland' },
  // Africa
  { value: 'Africa/Johannesburg', label: 'South Africa Time (SAST) - Johannesburg' },
  { value: 'Africa/Cairo', label: 'Eastern European Time (EET) - Cairo' },
  { value: 'Africa/Lagos', label: 'West Africa Time (WAT) - Lagos' },
  // UTC
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

// URL validation helper
export const validateUrl = (url: string): string | true => {
  if (!url || url.trim() === '') return true;
  
  let urlToValidate = url.trim();
  if (!urlToValidate.match(/^https?:\/\//i)) {
    urlToValidate = 'https://' + urlToValidate;
  }
  
  try {
    new URL(urlToValidate);
    return true;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Normalize URL helper
export const normalizeUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  const trimmed = url.trim();
  if (!trimmed.match(/^https?:\/\//i)) {
    return 'https://' + trimmed;
  }
  return trimmed;
};
