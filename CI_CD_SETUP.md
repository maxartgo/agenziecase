# CI/CD Pipeline - Setup Completo

## Stato Attuale

### ✅ Workflow Attivi
1. **ci.yml** - Pipeline principale con:
   - Backend tests (PostgreSQL)
   - Frontend tests + coverage
   - Security scan (npm audit)
   - Docker build (test)
   - Deploy staging (sviluppo)
   - Deploy production (main)

2. **code-quality.yml** - Quality checks:
   - ESLint (frontend + backend)
   - Prettier check
   - Type check (disabilitato)

### ⏸️ Workflow Disabilitati
1. **docker-build.yml.disabled** - Build e push immagini Docker
2. **e2e-tests.yml.disabled** - Test E2E Playwright

---

## Problemi Identificati

### 1. Deploy Configurazione Incompleta
I job `deploy-staging` e `deploy-production` non hanno comandi di deploy reali:
```yaml
- name: Deploy to production
  run: |
    echo "Deploying to production environment..."
    # Add deployment commands here
```

### 2. Docker Build non Pusha
Il workflow docker-build ha `push: false`, quindi non carica le immagini.

### 3. E2E Tests Disabilitati
Playwright test sono pronti ma il workflow è disabilitato.

---

## Soluzione Proposta

### Opzione A: Deploy Automatico su Hetzner (Consigliata)
Utilizzare SSH per deploy automatico sul server Hetzner esistente.

**Vantaggi:**
- Server già configurato
- Nessun costo aggiuntivo
- Deploy semplice via SSH

**Implementazione:**
```yaml
deploy-production:
  steps:
    - name: Deploy to Hetzner
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HETZNER_HOST }}
        username: ${{ secrets.HETZNER_USER }}
        key: ${{ secrets.HETZNER_SSH_KEY }}
        script: |
          cd /root/agenziecase
          git pull origin main
          docker compose pull
          docker compose up -d --build
          docker system prune -f
```

### Opzione B: GitHub Container Registry + Deploy
Build e push immagini su GHCR, poi deploy via SSH.

**Vantaggi:**
- Immagini versionate
- Rollback facile

---

## Azioni Immediate

1. **Abilitare E2E tests** → Rinominare `e2e-tests.yml.disabled` → `e2e-tests.yml`

2. **Configurare secrets GitHub** (Settings → Secrets):
   - `HETZNER_HOST` = 178.104.183.66
   - `HETZNER_USER` = root
   - `HETZNER_SSH_KEY` = (chiave privata SSH)
   - `CODECOV_TOKEN` = (token Codecov opzionale)

3. **Implementare deploy reale** in `ci.yml`

4. **Abilitare docker-build** con push al registry

---

## Prossimi Step

1. Setup secrets GitHub
2. Implementare deploy SSH in ci.yml
3. Abilitare E2E tests
4. Testare pipeline completa
5. Abilitare notifications (Slack/Discord) per deploy
