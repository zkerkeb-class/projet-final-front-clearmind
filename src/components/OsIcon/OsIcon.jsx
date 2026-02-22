import React from 'react';
import { Monitor, Terminal, Command, Smartphone, HelpCircle } from 'lucide-react';
import { TARGET_OS, OS_COLORS } from '../../utils/constants';

const OsIcon = ({ os, size = 14, color, strokeWidth = 2 }) => {
  const iconColor = color || OS_COLORS[os] || '#555';
  const props = { size, color: iconColor, strokeWidth };

  switch (os) {
    case TARGET_OS.WINDOWS: return <Monitor {...props} />;
    case TARGET_OS.LINUX: return <Terminal {...props} />;
    case TARGET_OS.MACOS: return <Command {...props} />;
    case TARGET_OS.ANDROID: return <Smartphone {...props} />;
    case TARGET_OS.IOS: return <Smartphone {...props} />;
    default: return <HelpCircle {...props} />;
  }
};

export default OsIcon;