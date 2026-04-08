# meetingspot

Prototype front + backend pour une app de plans spontanes.

## Stack

- Node.js
- Express
- SQLite via `better-sqlite3`
- React en JSX
- Vite

## Lancer le projet

```bash
npm install
npm run dev
```

En dev:

- le backend API tourne sur `http://localhost:3000`
- le front Vite tourne sur `http://localhost:5173`

Pour un build production:

```bash
npm run build
npm start
```

## API actuelle

- `GET /api/health`
- `GET /api/me`
- `GET /api/users`
- `GET /api/overview`
- `GET /api/presence`
- `GET /api/plans`
- `GET /api/plans/:id`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/plans`
- `POST /api/plans/:id/rsvp`

Filtres supportes:

- `GET /api/overview?filter=all|now|tonight|online&circle=...&visibility=...`
- `GET /api/plans?filter=all|now|tonight|online&circle=...&visibility=...`

## Notes

- La base SQLite est creee automatiquement dans `data/meetingspot.db`.
- Les donnees initiales sont seedees au premier lancement.
- L'auth est legere: session cookie en memoire, selection de profil cote UI, pas encore de mot de passe.
- Les routes front sont maintenant gerees par React Router.
- Le front React est decoupe entre `pages/`, `components/`, `constants/` et `lib/`.
