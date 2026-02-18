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