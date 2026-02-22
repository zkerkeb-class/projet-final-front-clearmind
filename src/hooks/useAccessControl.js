import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const useAccessControl = (isAuthorized, honeypotUrl, redirectPath = '/dashboard') => {
  const navigate = useNavigate();
  const hasLoggedAccess = useRef(false);

  useEffect(() => {
    if (!isAuthorized) {
      if (!hasLoggedAccess.current) {
        api.get(honeypotUrl).catch(() => {});
        hasLoggedAccess.current = true;
      }
      navigate(redirectPath);
    }
  }, [isAuthorized, honeypotUrl, redirectPath, navigate]);

  return !isAuthorized;
};