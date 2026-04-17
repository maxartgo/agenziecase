# 📋 Guida GitHub - Creazione Repository + Upload

## 🚀 CREA REPOSITORY GITHUB

### 1. Vai su GitHub
- Apri browser: https://github.com
- Login o crea account

### 2. Crea Repository
- Clicca **"+" → "New repository"**
- Compila:
  - **Repository name**: `agenziecase`
  - **Description**: `Piattaforma immobiliare CRM`
  - **Public/Private**: `Private` ✅
- **NON** spuntare nulla (README, .gitignore, license)
- **"Create repository"**

### 3. Copia la URL del Repository
Dopo la creazione, GitHub ti mostrerà qualcosa come:
```
https://github.com/tuo-username/agenziecase.git
```

**Copia questa URL!** 👆

---

## 📤 CARICA IL TUO PROGETTO SU GITHUB

### Dal tuo terminale locale (nella directory del progetto):

```bash
# Vai nella directory del progetto
cd C:\Users\uffic\Desktop\agenziecase

# Inizializza git (se non già fatto)
git init

# Aggiungi tutti i file
git add .

# Primo commit
git commit -m "Initial commit - AgenzieCase Platform"

# Aggiungi repository remoto (SOSTITUISCI con la tua URL)
git remote add origin https://github.com/tuo-username/agenziecase.git

# Push su GitHub
git branch -M main
git push -u origin main
```

### Se ti chiede le credenziali:
- **Username**: il tuo username GitHub
- **Password**: usa il tuo **Personal Access Token** (non la password GitHub)

---

## 🔑 CREA PERSONAL ACCESS TOKEN (Se richiesto)

### GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)

1. Vai su: https://github.com/settings/tokens
2. Clicca **"Generate new token"** → **"Generate new token (classic)"**
3. Compila:
   - **Note**: `AgenzieCase Deployment`
   - **Expiration**: `90 days`
   - **Scopes**: Seleziona `repo` (tutti)
4. Clicca **"Generate token"**
5. **Copia il token** (lo mostrerà una sola volta!)

Usa questo token invece della password quando fai `git push`.

---

## ✅ VERIFICA SU GITHUB

1. Vai su: https://github.com/tuo-username/agenziecase
2. Dovresti vedere tutti i file del progetto
3. ✅ Repository pronto per il deployment!

---

## 🚀 DOPO AVERE LA URL DEL REPOSITORY

Torna qui e dammi la URL completa, es:
```
https://github.com/tuo-username/agenziecase.git
```

Io procederò immediatamente a:
1. Clonare il repository sul server Hetzner
2. Deployare l'applicazione
3. Configurare tutto in produzione

---

## ⏱️ TEMPI STIMATI

- Creazione repository GitHub: **2 minuti**
- Upload progetto locale: **3 minuti**
- Deploy su Hetzner: **5 minuti**

**TOTALE**: **10 minuti** e sei live! 🚀