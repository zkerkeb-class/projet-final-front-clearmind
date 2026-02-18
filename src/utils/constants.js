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