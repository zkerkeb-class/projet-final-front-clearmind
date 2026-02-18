/**
 * Décoder le payload du JWT sans librairie externe lourde.
 * Cela permet de lire le rôle "gravé" dans le token par le backend.
 */
export const getPayloadFromToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erreur de décodage du token", e);
    return null;
  }
};

/**
 * Récupère le rôle sécurisé de l'utilisateur actuel.
 * @returns {string} 'admin' | 'pentester' | 'guest'
 */
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return 'guest';
  
  const payload = getPayloadFromToken(token);
  // Si le token est expiré ou invalide, on considère l'utilisateur comme guest
  if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
    return 'guest';
  }
  
  return payload.role || 'guest';
};
