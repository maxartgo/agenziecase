# 📐 Code Quality Standards - AgenzieCase

**Status**: 🟡 Parziale | **Priorità**: ALTA | **Owner**: TBD

---

## 🎯 Obiettivi

- [ ] Codice linting senza errori
- [ ] Formattazione automatica coerente
- [ ] Convenzioni naming consistenti
- [ ] Documentazione completa
- [ ] Code review process
- [ ] Pre-commit hooks attivi

---

## 📋 Standard Codice

### Convenzioni Naming

#### JavaScript/React
```javascript
// ✅ BUONO
const getUserData = async () => {};
const isActive = true;
const MAX_RETRY = 3;
const user_id = 1; // solo per database IDs

// Component names: PascalCase
const PropertyCard = () => {};

// ❌ EVITARE
const get_user_data = async () => {};
const active = true;
const max_retry = 3;
```

#### File Naming
```
// Components: PascalCase
PropertyCard.jsx
UserProfile.jsx

// Utilities: camelCase
apiHelpers.js
dateUtils.js

// Hooks: camelCase con 'use' prefix
useVoice.js
useAuth.js

// Styles: camelCase
propertyCardStyles.js
globalStyles.js
```

### Struttura Componenti

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Types/interfaces (TypeScript)
interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

// 3. Constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// 4. Component declaration
export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  // 5. Hooks
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 7. Handlers
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // 8. Render helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT').format(price);
  };

  // 9. Render
  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  );
};

export default PropertyCard;
```

### Best Practices

#### 1. Component Size
```javascript
// ✅ BUONO - Componente focalizzato
const PropertyCard = ({ property }) => {
  return (
    <div>
      <PropertyImage images={property.images} />
      <PropertyInfo property={property} />
      <PropertyActions property={property} />
    </div>
  );
};

// ❌ EVITARE - Componente monolitico
const PropertyCard = ({ property }) => {
  // 500+ righe di logica mista
};
```

#### 2. State Management
```javascript
// ✅ BUONO - State locale per component-specific data
const PropertyCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
};

// ✅ BUONO - Context per shared state
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);

  return (
    <AppContext.Provider value={{ user, properties }}>
      {children}
    </AppContext.Provider>
  );
};

// ❌ EVITARE - Prop drilling profondo
<PropertyCard property={property} onUpdate={onUpdate} onDelete={onDelete} user={user} />
```

#### 3. Error Handling
```javascript
// ✅ BUONO - Error boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage />;
    }
    return this.props.children;
  }
}

// ✅ BUONO - Try-catch per async operations
const fetchProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    toast.error('Impossibile caricare gli immobili');
    return [];
  }
};
```

#### 4. API Calls
```javascript
// ✅ BUONO - Separato in service layer
// services/propertyService.js
export const propertyService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/properties', data);
    return response.data;
  }
};

// Usage
const properties = await propertyService.getAll(filters);

// ❌ EVITARE - API calls nei componenti
const Component = () => {
  useEffect(() => {
    fetch('/api/properties').then(res => res.json())...
  }, []);
};
```

---

## 🛠️ Setup ESLint + Prettier

### Installazione
```bash
npm install --save-dev eslint prettier
npm install --save-dev eslint-config-react-app
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

### Configurazione ESLint
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:prettier/recommended'
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### Configurazione Prettier
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Ignore Files
```
# .eslintignore
node_modules/
build/
dist/
coverage/

# .prettierignore
node_modules/
build/
dist/
coverage/
package-lock.json
```

---

## 🪝 Git Hooks

### Setup Husky
```bash
npm install --save-dev husky lint-staged
npx husky install
```

### Pre-commit Hook
```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### Lint-staged Configuration
```javascript
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 📊 Code Review Checklist

### Prima di Commit
- [ ] Codice formattato (Prettier)
- [ ] Nessun errore ESLint
- [ ] Nessun console.log lasciato
- [ ] Variabili e funzioni nominate chiaramente
- [ ] Commenti dove necessario
- [ ] Nessun codice commentato
- [ ] Imports organizzati
- [ ] Nessun dependency non utilizzata

### Durante Review
- [ ] Logica chiara e comprensibile
- [ ] Nessun duplicazione codice
- [ ] Performance considerata
- [ ] Error handling appropriato
- [ ] Security considerations
- [ ] Tests aggiornati
- [ ] Documentazione aggiornata

---

## 🔄 Refactoring Guidelines

### Quando Refactorare
1. **File troppo grandi** (> 500 righe)
2. **Componenti complessi** (troppe responsabilità)
3. **Codice duplicato**
4. **Performance issues**
5. **Mantenibilità difficoltosa**

### Refactoring Steps
1. **Scrivi test** prima di refactorare
2. **Applica piccoli cambiamenti** alla volta
3. **Verifica che i test passino**
4. **Commit dopo ogni cambiamento**
5. **Documenta le modifiche**

### Esempio Refactoring
```javascript
// PRIMA - Componente monolitico
const PropertyCreateModal = () => {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    // ... 20+ altri campi
  });

  const handleTitleChange = (e) => {
    setPropertyData({ ...propertyData, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setPropertyData({ ...propertyData, description: e.target.value });
  };

  // ... 20+ altri handlers

  return (
    <Modal>
      {step === 1 && <Step1 {...propertyData} onChange={...} />}
      {step === 2 && <Step2 {...propertyData} onChange={...} />}
      {/* ... */}
    </Modal>
  );
};

// DOPO - Componente modulare
const PropertyCreateModal = () => {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = usePropertyForm();

  return (
    <Modal>
      {step === 1 && (
        <BasicInfoStep
          data={propertyData}
          onChange={propertyData.update}
        />
      )}
      {step === 2 && (
        <LocationStep
          data={propertyData}
          onChange={propertyData.update}
        />
      )}
    </Modal>
  );
};

// Custom hook per form logic
const usePropertyForm = () => {
  const [data, setData] = useState({
    title: '',
    description: '',
    price: ''
    // ...
  });

  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return { data, update };
};
```

---

## 📝 Documentazione

### JSDoc Comments
```javascript
/**
 * Fetches properties from the API with optional filters
 * @param {Object} filters - Search filters
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {string} filters.city - City filter
 * @returns {Promise<Property[]>} Array of properties
 * @throws {Error} If API request fails
 */
export const fetchProperties = async (filters = {}) => {
  const response = await api.get('/properties', { params: filters });
  return response.data;
};
```

### Component Documentation
```javascript
/**
 * PropertyCard Component
 *
 * Displays a property card with image, title, price, and basic info.
 * Handles click events for navigation to property details.
 *
 * @component
 * @example
 * <PropertyCard
 *   property={propertyData}
 *   onClick={() => navigate(`/properties/${propertyData.id}`)}
 * />
 */
```

---

## 🎯 Code Quality Metrics

### Da Monitorare
- **Complexity Cyclomatic**: < 10 per funzione
- **Lines per Function**: < 50
- **Parameters per Function**: < 5
- **Nesting Depth**: < 4
- **File Length**: < 500 righe
- **Test Coverage**: > 80%

### Strumenti di Analisi
```bash
# Complexity analysis
npm install -g complexity-report

# Duplicate code detection
npm install -g jsinspect

# Dependency analysis
npm install -g depcheck

# Run analysis
npx depcheck
npx jsinspect src/
```

---

## 📚 Risorse

- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Best Practices](https://reactpatterns.com/)
