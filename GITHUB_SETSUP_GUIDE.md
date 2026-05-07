# GitHub Secrets Configuration Guide

## Secrets Richiesti per CI/CD

Vai su: **Repository Settings** → **Secrets and variables** → **Actions**

### Required Secrets for Deploy

| Nome | Descrizione | Valore |
|------|-------------|--------|
| `HETZNER_HOST` | IP del server Hetzner | `178.104.183.66` |
| `HETZNER_USER` | Utente SSH | `root` |
| `HETZNER_SSH_KEY` | Chiave privata SSH | (vedi sotto) |

### Optional Secrets

| Nome | Descrizione | Valore |
|------|-------------|--------|
| `CODECOV_TOKEN` | Token Codecov coverage | (se usi Codecov) |
| `SLACK_WEBHOOK` | Slack notifications | (opzionale) |

---

## Come Generare la Chiave SSH

### Opzione 1: Usare chiave esistente sul server

1. Connettiti al server:
```bash
ssh root@178.104.183.66
```

2. Copia la chiave privata esistente:
```bash
cat ~/.ssh/id_rsa
```

Copia l'intero output (incluso BEGIN e END RSA PRIVATE KEY).

### Opzione 2: Generare nuova chiave

1. Genera coppia di chiavi:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions
```

2. Copia la chiave pubblica sul server:
```bash
ssh-copy-id -i ~/.ssh/github_actions.pub root@178.104.183.66
```

3. Copia la chiave privata:
```bash
cat ~/.ssh/github_actions
```

---

## Setup Secrets su GitHub

1. Vai al repository: https://github.com/[tuo-username]/agenziecase/settings/secrets/actions

2. Clica **New repository secret**

3. Aggiungi i secrets:
   - **Name**: `HETZNER_HOST`
   - **Secret**: `178.104.183.66`
   - Clica **Add secret**

4. Ripeti per:
   - `HETZNER_USER` → `root`
   - `HETZNER_SSH_KEY` → (chiave privata SSH completa)

---

## Verifica Setup

### Test locale SSH
```bash
ssh -i ~/.ssh/github_actions root@178.104.183.66 "docker compose ps"
```

### Test con chiave temporanea
Crea un file temporaneo con la chiave:
```bash
cat > /tmp/test_key << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
... tua chiave qui ...
-----END OPENSSH PRIVATE KEY-----
EOF

chmod 600 /tmp/test_key
ssh -i /tmp/test_key root@178.104.183.66 "hostname"
```

---

## Troubleshooting

### Errore: "Permission denied (publickey)"
- Verifica che la chiave sia corretta
- Verifica che la chiave pubblica sia nel server (`~/.ssh/authorized_keys`)
- Verifica che il file abbia i permessi corretti (`chmod 600`)

### Errore: "Host key verification failed"
Aggiungi questo al comando SSH:
```
- StrictHostKeyChecking: no
```

### Deploy non parte
- Verifica che il branch sia `main` (non `master`)
- Verifica che i secrets siano corretti
- Controlla i log Actions su GitHub

---

## Next Steps

1. ✅ Configura secrets su GitHub
2. ✅ Pusha le modifiche al branch main
3. ✅ Verifica che il workflow parta automaticamente
4. ✅ Controlla i log del deploy
5. ✅ Verifica che il sito funzioni (https://agenziecase.com)
