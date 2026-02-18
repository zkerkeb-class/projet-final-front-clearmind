# Justification du choix d'authentification (JWT) :

Nous avons opté pour une authentification basée sur les JSON Web Tokens (JWT) plutôt que sur les sessions serveur classiques pour plusieurs raisons :

- Architecture Stateless (Sans état) : Le serveur n'a pas besoin de stocker l'état de session de chaque utilisateur en mémoire ou en base de données. Cela rend l'application plus rapide et facilite la scalabilité (montée en charge) si nous devions ajouter plusieurs serveurs backend.
- Performance : La vérification du token se fait par calcul cryptographique (signature) sans nécessiter une requête en base de données à chaque appel API pour vérifier une table de sessions.
- Flexibilité Frontend : Le token est stocké côté client (LocalStorage), ce qui permet au Frontend (React) de gérer facilement l'état "connecté" et d'accéder aux informations utilisateur (ID, Rôle) directement depuis le payload du token sans re-interroger le serveur.
- Sécurité : Les tokens sont signés numériquement côté serveur, garantissant qu'ils n'ont pas été altérés. Nous avons également mis en place une expiration automatique pour limiter les risques en cas de vol de token.