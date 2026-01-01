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
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
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
