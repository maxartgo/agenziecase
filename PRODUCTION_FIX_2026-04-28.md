# 🔧 Produzione Fix — 28 Aprile 2026

## Server: Hetzner 178.104.183.66 | Dominio: agenziecase.com

---

## Problemi Riscontrati

1. **Backend in modalità sviluppo in produzione** — `docker-compose.override.yml` attivava `NODE_ENV=development` e `npm run dev`
2. **API key e secrets in chiaro nel compose** — credenziali visibili in `docker compose config`
3. **Frontend container unhealthy** — healthcheck usava `localhost` che risolveva IPv6 (`::1`), ma nginx ascolta solo su IPv4
4. **Attacchi bot su path `.env`** — scanner ricevevano 200 per via del fallback SPA `try_files`
5. **Disco cresciuto a 14GB** — immagini Docker e cache non pulite

---

## Interventi Eseguiti

### 1. Fix Backend — Produzione
- **Rimosso** `docker-compose.override.yml` dal server (causa root del problema)
- Il backend ora usa `NODE_ENV=production` e `CMD ["node", "index.js"]` dal Dockerfile
- Secrets ora lette solo dal `.env` protetto (non più visibili in `docker compose config`)

### 2. Fix Healthcheck Frontend
- Modificato `docker-compose.yml` e `frontend/Dockerfile`: `localhost` → `127.0.0.1`
- Container frontend passato da `unhealthy` a `healthy`

### 3. Sicurezza Nginx
- Aggiunti blocchi in `frontend/nginx.conf`:
  - `location ~ /\.` → deny all (file nascosti)
  - `location ~* /\.env$` → 404 esplicito
  - `location ~* ^/(server|node_modules|vendor|config|projbackend|directories|apps|actions-server|http|Assignment3|src/main)/` → 404
- Bot scanner ora ricevono 404 invece di 200

### 4. Pulizia Disco Server
- `docker system prune -a -f`
- Rimossi container/volumi/immagini orfani
- Spazio disco riportato a valori ottimali

### 5. Repository & Deploy
- `docker-compose.override.yml` rinominato in `.example` e aggiunto a `.gitignore`
- Commit e push delle modifiche
- Pull sul server e rebuild container

---

## Stato Post-Intervento

```
✅ agenziecase-frontend   → healthy   (Porta 80)
✅ agenziecase-backend    → healthy   (Porta 3456)
✅ agenziecase-db         → healthy   (Porta 5432)
✅ agenziecase-redis      → healthy   (Porta 6379)
```

- **Sito web:** https://agenziecase.com — OK 200
- **API health:** `/api/health` — OK
- **Disco:** ~6GB usati (da 14GB)
- **Security headers:** attivi
- **Bot scans:** 404

---

## File Modificati

- `docker-compose.yml`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `.gitignore`
- `docker-compose.override.yml` → `docker-compose.override.yml.example`
- `PRODUCTION_FIX_2026-04-28.md` (questo file)

---

### 6. Fix Registrazione Partner (Upload Documenti)
- **Problema:** Multer usava `__dirname + ../../uploads/partners` che in Docker risolveva a `/uploads/partners` (inesistente)
- **Fix:**
  - Cambiato in `path.join(process.cwd(), 'uploads', 'partners')` → `/app/uploads/partners`
  - Aggiunto `fs.mkdirSync(..., { recursive: true })` per creazione directory on-demand
  - Aggiunto volume `./uploads:/app/uploads` nel `docker-compose.yml`
- Test: directory verificata nel container, upload funzionante

---

*Ultimo aggiornamento: 28 Aprile 2026*
