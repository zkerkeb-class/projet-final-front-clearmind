import { BOX_DIFFICULTIES } from './constants';

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case BOX_DIFFICULTIES.EASY: return '#00ff41';
    case BOX_DIFFICULTIES.MEDIUM: return '#ff8000';
    case BOX_DIFFICULTIES.HARD: return '#ff003c';
    case BOX_DIFFICULTIES.INSANE: return '#b026ff';
    default: return '#00d4ff';
  }
};

export const getCriticality = (title) => {
  const t = title.toLowerCase();
  if (t.includes('critical') || t.includes('rce') || t.includes('zero-day') || t.includes('0-day') || t.includes('pre-auth')) {
    return 'critical';
  }
  if (t.includes('high') || t.includes('exploit') || t.includes('vulnerability') || t.includes('bypass') || t.includes('cve')) {
    return 'high';
  }
  if (t.includes('malware') || t.includes('ransomware') || t.includes('backdoor') || t.includes('trojan') || t.includes('campaign') || t.includes('attack') || t.includes('breach') || t.includes('hack')) {
    return 'medium';
  }
  return 'low';
};