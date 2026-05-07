# 📚 API Documentation - AgenzieCase

## 📋 Overview

RESTful API per l'integrazione con la piattaforma AgenzieCase.

**Base URL:** `https://agenziecase.com/api`

**Authentication:** Bearer Token (JWT)

**Content-Type:** `application/json`

---

## 🔑 Authentication

### Ottenere Token

```http
POST /api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "partner"
  }
}
```

### Usare il Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token

```http
POST /api/auth/refresh
```

---

## 🏠 Immobili (Properties)

### Lista Immobili

```http
GET /api/properties
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20) |
| city | string | Filter by city |
| type | string | Property type (apartment, villa, etc.) |
| contract | string | sale or rent |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| minSurface | number | Minimum surface (mq) |
| maxSurface | number | Maximum surface (mq) |
| rooms | number | Number of rooms |
| furnished | boolean | Furnished property |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Appartamento Milano Centro",
      "description": "Bellissimo appartamento...",
      "price": 350000,
      "surface": 85,
      "rooms": 3,
      "bathrooms": 2,
      "city": "Milano",
      "address": "Via Roma 10",
      "contract": "sale",
      "furnished": true,
      "images": [
        {
          "url": "https://agenziecase.com/uploads/property_1_image1.jpg",
          "isCover": true
        }
      ],
      "floorPlans": [],
      "virtualTour": "https://...",
      "featured": true,
      "partnerId": 5,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

### Dettaglio Immobile

```http
GET /api/properties/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "Appartamento Milano Centro",
  "description": "...",
  "price": 350000,
  "surface": 85,
  "rooms": 3,
  "bathrooms": 2,
  "floor": 3,
  "hasElevator": true,
  "furnished": true,
  "yearBuilt": 2010,
  "heating": "autonomous",
  "energyClass": "B",
  "city": "Milano",
  "address": "Via Roma 10",
  "zipCode": "20100",
  "contract": "sale",
  "images": [...],
  "floorPlans": [...],
  "virtualTour": "...",
  "video": "...",
  "featured": true,
  "partner": {
    "id": 5,
    "name": "Agenzia Immobiliare Milano",
    "phone": "+39 02 1234567",
    "email": "info@agenziamilano.it"
  },
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-05T14:30:00Z"
}
```

### Crea Immobile (Partner Only)

```http
POST /api/properties
```

**Request:**
```json
{
  "title": "Appartamento Centro",
  "description": "Descrizione completa...",
  "price": 350000,
  "surface": 85,
  "rooms": 3,
  "bathrooms": 2,
  "floor": 3,
  "hasElevator": true,
  "furnished": true,
  "yearBuilt": 2010,
  "heating": "autonomous",
  "energyClass": "B",
  "city": "Milano",
  "address": "Via Roma 10",
  "zipCode": "20100",
  "contract": "sale",
  "images": [
    {
      "url": "https://...",
      "isCover": true,
      "isFeatured": true
    }
  ],
  "virtualTour": "https://matterport.com/...",
  "video": "https://youtube.com/watch?v=..."
}
```

### Aggiorna Immobile

```http
PUT /api/properties/:id
```

### Elimina Immobile

```http
DELETE /api/properties/:id
```

---

## 👥 CRM - Clienti

### Lista Clienti (Partner Only)

```http
GET /api/crm/clients
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Mario Rossi",
      "email": "mario.rossi@email.com",
      "phone": "+39 333 1234567",
      "source": "web",
      "status": "new",
      "preferences": {
        "cities": ["Milano", "Monza"],
        "minPrice": 200000,
        "maxPrice": 400000,
        "minSurface": 70
      },
      "notes": "Cerca appartamento vicino metro",
      "partnerId": 5,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Crea Cliente

```http
POST /api/crm/clients
```

**Request:**
```json
{
  "name": "Mario Rossi",
  "email": "mario.rossi@email.com",
  "phone": "+39 333 1234567",
  "source": "web",
  "preferences": {
    "cities": ["Milano"],
    "minPrice": 200000,
    "maxPrice": 400000
  },
  "notes": "Cliente interessato a zona centro"
}
```

### Aggiorna Cliente

```http
PUT /api/crm/clients/:id
```

### Elimina Cliente

```http
DELETE /api/crm/clients/:id
```

---

## 📅 CRM - Appuntamenti

### Lista Appuntamenti

```http
GET /api/crm/appointments
```

**Query Parameters:**
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)
- `clientId`: Filter by client

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clientId": 5,
      "propertyId": 12,
      "scheduledAt": "2026-05-10T14:30:00Z",
      "status": "scheduled",
      "notes": "Portare chiave scala A",
      "client": {
        "id": 5,
        "name": "Mario Rossi",
        "phone": "+39 333 1234567"
      },
      "property": {
        "id": 12,
        "title": "Appartamento Via Roma",
        "address": "Via Roma 10, Milano"
      }
    }
  ]
}
```

### Crea Appuntamento

```http
POST /api/crm/appointments
```

**Request:**
```json
{
  "clientId": 5,
  "propertyId": 12,
  "scheduledAt": "2026-05-10T14:30:00Z",
  "notes": "Portare chiave scala A"
}
```

---

## 💼 CRM - Trattative

### Lista Trattative

```http
GET /api/crm/deals
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "clientId": 5,
      "propertyId": 12,
      "offeredPrice": 340000,
      "status": "negotiation",
      "conditions": "Pagamento trimestrale",
      "expiresAt": "2026-05-20T00:00:00Z",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

### Stati Trattativa
- `proposal`: Proposta inviata
- `negotiation`: In negoziazione
- `accepted`: Accettata
- `rejected`: Rifiutata
- `closed`: Chiusa (contratto firmato)

---

## 📊 Analytics

### Statistiche Generali

```http
GET /api/analytics/overview
```

**Response:**
```json
{
  "totalProperties": 1523,
  "activeProperties": 1456,
  "totalViews": 45678,
  "totalContacts": 234,
  "topCities": [
    { "city": "Milano", "count": 456 },
    { "city": "Roma", "count": 312 }
  ]
}
```

### Statistiche Immobile (Partner Only)

```http
GET /api/analytics/properties/:id
```

**Response:**
```json
{
  "propertyId": 1,
  "views": 234,
  "contacts": 12,
  "favorites": 45,
  "avgTimeOnPage": 45,
  "dailyViews": [
    { "date": "2026-05-01", "views": 23 },
    { "date": "2026-05-02", "views": 31 }
  ]
}
```

---

## 🔔 Preferiti

### Aggiungi Preferito

```http
POST /api/favorites
```

**Request:**
```json
{
  "propertyId": 1
}
```

### Rimuovi Preferito

```http
DELETE /api/favorites/:propertyId
```

### Lista Preferiti

```http
GET /api/favorites
```

---

## 📞 Contatti

### Invia Contatto

```http
POST /api/contacts
```

**Request:**
```json
{
  "propertyId": 1,
  "name": "Mario Rossi",
  "email": "mario@email.com",
  "phone": "+39 333 1234567",
  "message": "Vorrei maggiori informazioni..."
}
```

---

## 🏢 Partner

### Registrazione Partner

```http
POST /api/partners/register
```

**Request:**
```json
{
  "agencyName": "Agenzia Immobiliare Milano",
  "vatNumber": "IT12345678901",
  "address": "Via Roma 10",
  "city": "Milano",
  "zipCode": "20100",
  "phone": "+39 02 1234567",
  "email": "info@agenziamilano.it",
  "password": "SecurePass123!"
}
```

---

## ❌ Errori

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| UNAUTHORIZED | Invalid or missing token |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| DUPLICATE_ENTRY | Resource already exists |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Server error |

---

## 🔄 Rate Limiting

- **Anonymous**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **Partner**: 5000 requests/hour

Headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1715107200
```

---

## 📝 Webhooks

### Configura Webhook (Partner Only)

```http
POST /api/webhooks
```

**Request:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["contact.created", "appointment.scheduled"]
}
```

### Eventi Disponibili
- `contact.created`: Nuovo contatto ricevuto
- `appointment.scheduled`: Nuovo appuntamento
- `deal.status_changed`: Stato trattativa cambiato
- `property.approved`: Immobile approvato

### Webhook Payload

```json
{
  "event": "contact.created",
  "timestamp": "2026-05-07T10:30:00Z",
  "data": {
    "id": 123,
    "propertyId": 456,
    "name": "Mario Rossi",
    "email": "mario@email.com",
    "message": "Vorrei visitare..."
  }
}
```

---

## 🧪 Testing

### Sandbox Environment
Per testing delle API, usa:
- **Base URL**: `https://agenziecase.com/api`
- **Authentication**: Usa token di test

### Esempi cURL

```bash
# Login
curl -X POST https://agenziecase.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Lista immobili
curl https://agenziecase.com/api/properties?city=Milano&contract=sale

# Crea immobile (con auth)
curl -X POST https://agenziecase.com/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Appartamento","price":350000,...}'
```

---

## 📞 Support

Per assistenza API:
- **Email**: api-support@agenziecase.com
- **Documentation**: https://agenziecase.com/docs/api
- **Status**: https://status.agenziecase.com

---

**Versione API:** v1.0
**Base URL:** https://agenziecase.com/api
**Ultimo aggiornamento:** 2026-05-07
