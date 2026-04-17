# 🧪 Testing Strategy - AgenzieCase

**Status**: 🔴 Non iniziato | **Priorità**: CRITICA | **Owner**: TBD

---

## 📋 Obiettivi

- [ ] Raggiungere **80%+ coverage** code
- [ ] Test suite veloce (< 5 min per run completo)
- [ ] Test automatizzati in CI
- [ ] Test e2e per flussi critici

---

## 🛠️ Stack Tecnologico

### Framework
- **Unit Testing**: Jest + React Testing Library
- **API Testing**: Supertest
- **E2E Testing**: Playwright o Cypress
- **Coverage**: Istanbul (nativo in Jest)

### Struttura Test
```
agenziecase/
├── frontend/
│   └── src/
│       ├── __tests__/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── utils/
│       └── setupTests.js
└── server/
    └── __tests__/
        ├── unit/
        ├── integration/
        └── e2e/
```

---

## 📊 Piano di Implementazione

### FASE 1: Setup e Configurazione ⏱️ 1 giorno

#### 1.1 Installazione Dipendenze
```bash
# Frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Backend
npm install --save-dev jest supertest @types/jest
```

#### 1.2 Configurazione Jest
- [ ] Setup Jest per frontend (vite.config.js)
- [ ] Setup Jest per backend
- [ ] Configurare test environment
- [ ] Setup coverage thresholds
- [ ] Configurare script test in package.json

#### 1.3 Test Utilities
- [ ] Creare test helpers
- [ ] Setup mock data
- [ ] Configurare test database
- [ ] API testing utilities

### FASE 2: Test Unitari Frontend ⏱️ 3-4 giorni

#### 2.1 Component Testing (Priorità)
- [ ] **AgenzieCase.jsx** - Test componenti principali
  - [ ] Rendering corretto
  - [ ] User interactions
  - [ ] State management
  - [ ] API calls (mockate)

- [ ] **CRMDashboard.jsx**
  - [ ] Visualizzazione clienti
  - [ ] Filtri e ricerca
  - [ ] CRUD operazioni

- [ ] **PropertyCreateModal.jsx**
  - [ ] Form validation
  - [ ] Upload immagini
  - [ ] Preview

#### 2.2 Hooks Testing
- [ ] **useVoice** hook
- [ ] Custom hooks per API
- [ ] Authentication hooks

#### 2.3 Utils Testing
- [ ] Formatters (currency, date)
- [ ] Validators
- [ ] Helper functions

### FASE 3: Test Unitari Backend ⏱️ 3-4 giorni

#### 3.1 Models Testing
- [ ] **User** model
  - [ ] Validation
  - [ ] Associations
  - [ ] Hooks (beforeCreate, etc.)

- [ ] **Property** model
- [ ] **Client** model
- [ ] **Deal** model
- [ ] **Appointment** model
- [ ] **Activity** model
- [ ] Altri models...

#### 3.2 Controllers Testing
- [ ] Auth controller
- [ ] Property controller
- [ ] Client controller
- [ ] Deal controller
- [ ] Appointment controller
- [ ] Activity controller
- [ ] AI controller (chat, search)

#### 3.3 Middleware Testing
- [ ] Auth middleware (JWT)
- [ ] Upload middleware
- [ ] Error handling
- [ ] Validation middleware

#### 3.4 Routes Testing
- [ ] Auth routes
- [ ] Property routes
- [ ] CRM routes
- [ ] AI routes
- [ ] Admin routes

### FASE 4: Test Integrazione ⏱️ 2-3 giorni

#### 4.1 API Integration
- [ ] Auth flow completo
- [ ] Property CRUD
- [ ] CRM workflows
- [ ] AI chat integration

#### 4.2 Database Integration
- [ ] Database operations
- [ ] Transactions
- [ ] Rollbacks
- [ ] Data integrity

### FASE 5: Test E2E ⏱️ 2-3 giorni

#### 5.1 Flussi Utente Critici
- [ ] **Registration & Login**
  - [ ] Nuovo utente si registra
  - [ ] Login con credenziali
  - [ ] Logout
  - [ ] Password reset

- [ ] **Property Search**
  - [ ] Ricerca base
  - [ ] Filtri avanzati
  - [ ] Visualizzazione dettaglio
  - [ ] Salvataggio preferiti

- [ ] **CRM Agent**
  - [ ] Dashboard caricamento
  - [ ] Aggiunta cliente
  - [ ] Creazione appuntamento
  - [ ] Gestione trattative

- [ ] **AI Chat**
  - [ ] Chat init
  - [ ] Invio messaggio
  - [ ] Risposta AI
  - [ ] Ricerca intelligente

### FASE 6: Performance & Load Testing ⏱️ 1-2 giorni

- [ ] Setup k6 o Artillery
- [ ] Test carico API (1000 req/sec)
- [ ] Test concurrent users
- [ ] Database query performance
- [ ] Frontend rendering performance

---

## 📊 Coverage Targets

| Componente | Target | Attuale |
|------------|--------|---------|
| Frontend Components | 80% | 0% |
| Frontend Hooks | 90% | 0% |
| Backend Models | 90% | 0% |
| Backend Controllers | 80% | 0% |
| Backend Routes | 70% | 0% |
| **Totale** | **80%** | **0%** |

---

## 🎯 Milestone Testing

### Milestone 1: Foundation (Week 1)
- [ ] Setup completo Jest
- [ ] Test utilities pronti
- [ ] 10% coverage
- [ ] CI integration

### Milestone 2: Unit Tests (Week 2-3)
- [ ] Tutti i models testati
- [ ] Controllers principali testati
- [ ] Componenti principali testati
- [ ] 50% coverage

### Milestone 3: Integration (Week 4)
- [ ] API integration tests
- [ ] Database integration
- [ ] 70% coverage

### Milestone 4: E2E & Performance (Week 5)
- [ ] Flussi critici E2E
- [ ] Load tests completati
- [ ] 80%+ coverage
- [ ] Performance baseline

---

## 📝 Esempi Test

### Unit Test Component
```javascript
// src/__tests__/components/PropertyCard.test.jsx
import { render, screen } from '@testing-library/react';
import PropertyCard from '../components/PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: 1,
    title: 'Villa Centrale',
    price: 350000,
    city: 'Milano'
  };

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Villa Centrale')).toBeInTheDocument();
    expect(screen.getByText(/350.000/)).toBeInTheDocument();
  });
});
```

### Unit Test Controller
```javascript
// server/__tests__/unit/controllers/property.test.js
const request = require('supertest');
const app = require('../../app');

describe('Property Controller', () => {
  it('should return all properties', async () => {
    const response = await request(app)
      .get('/api/properties')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### E2E Test
```javascript
// e2e/registration.spec.js
import { test, expect } from '@playwright/test';

test('user registration flow', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

---

## 🔗 Script Utili

### package.json scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## 📚 Risorse

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [Playwright](https://playwright.dev/)
