export const ROLES = {
  GUEST: 'guest',
  PENTESTER: 'pentester',
  ADMIN: 'admin'
};

export const BOX_STATUSES = {
  TODO: 'Todo',
  IN_PROGRESS: 'In-Progress',
  USER_FLAG: 'User-Flag',
  ROOT_FLAG: 'Root-Flag'
};

export const BOX_DIFFICULTIES = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  INSANE: 'Insane'
};

export const BOX_CATEGORIES = {
  RED: 'Red',
  BLUE: 'Blue',
  PURPLE: 'Purple'
};

export const BOX_PLATFORMS = {
  HTB: 'HackTheBox',
  THM: 'TryHackMe',
  ROOT_ME: 'Root-Me',
  VULNHUB: 'VulnHub',
  OTHER: 'Other'
};

export const TARGET_STATUSES = {
  DISCOVERY: 'Discovery',
  SCANNING: 'Scanning',
  VULNERABLE: 'Vulnerable',
  COMPROMISED: 'Compromised',
  PATCHED: 'Patched'
};

export const TARGET_OS = {
  WINDOWS: 'Windows',
  LINUX: 'Linux',
  MACOS: 'MacOS',
  ANDROID: 'Android',
  IOS: 'iOS',
  UNKNOWN: 'Unknown'
};

export const TOOL_CATEGORIES = [
  'Reconnaissance',
  'Weaponization',
  'Delivery',
  'Exploitation',
  'Installation',
  'Command & Control',
  'Actions on Objectives'
];

export const PAYLOAD_SEVERITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const PAYLOAD_CATEGORIES = {
  WEB: [
    'XSS',
    'SQLi',
    'NoSQLi',
    'LFI',
    'RCE',
    'SSTI',
    'SSRF',
    'XXE'
  ],
  SYSTEM: [
    'Auth-Bypass',
    'Priv-Esc',
    'Command-Inj',
    'Directory-Trav',
    'IDOR'
  ],
  API: [
    'BOLA',
    'Mass-Assignment',
    'JWT-Attack',
    'GraphQL-Inj',
    'Rate-Limit-Bypass'
  ]
};

export const CODE_LANGUAGES = [
  { value: 'text', label: 'TEXT' },
  { value: 'bash', label: 'BASH' },
  { value: 'powershell', label: 'POWERSHELL' },
  { value: 'javascript', label: 'JAVASCRIPT' },
  { value: 'python', label: 'PYTHON' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'GO' },
  { value: 'java', label: 'JAVA' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'RUBY' },
  { value: 'rust', label: 'RUST' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'MARKDOWN' }
];

// Regex
export const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const CVE_REGEX = /CVE-\d{4}-\d{4,}/;

// Palettes de couleurs (Charts & UI)
export const CHART_COLORS = ['#00d4ff', '#bf00ff', '#ff003c', '#ffd700', '#00ff41', '#ff8c00'];

export const OS_COLORS = {
  [TARGET_OS.WINDOWS]: '#00a4ef',
  [TARGET_OS.LINUX]: '#f0c674',
  [TARGET_OS.MACOS]: '#999999',
  [TARGET_OS.ANDROID]: '#3ddc84',
  [TARGET_OS.IOS]: '#5856d6',
  [TARGET_OS.UNKNOWN]: '#555'
};