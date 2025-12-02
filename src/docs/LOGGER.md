# Sistema de Logging

Sistema centralizado de logging para rastreamento, debug e monitoramento de erros.

## Estrutura

```
src/logger/
├── logger.js              # Logger principal com níveis de severidade
├── errorLogger.js         # Rastreamento e captura de erros
├── performanceMonitor.js  # Monitoramento de performance e Web Vitals
└── index.js              # Exports centralizados
```

## Componentes

### 1. Logger Principal (`logger.js`)

Sistema de logs com níveis de severidade e formatação.

**Níveis de Log:**

- `DEBUG`: Informações detalhadas (apenas desenvolvimento)
- `INFO`: Informações gerais
- `WARN`: Avisos
- `ERROR`: Erros

**Uso básico:**

```javascript
import { logger } from '@/logger';

// Logs simples
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// Logs com contexto
logger.info('User logged in', {
  userId: 123,
  email: 'user@example.com',
});

// Log de erro com stack trace
try {
  // código
} catch (error) {
  logger.errorWithStack('Operation failed', error, {
    operation: 'saveData',
  });
}

// Logs especializados
logger.apiRequest('POST', '/api/users', { name: 'John' });
logger.apiResponse('POST', '/api/users', 201, { id: 1 });
logger.userAction('click_button', { button: 'submit' });
logger.navigation('/dashboard', '/profile');
logger.performance('dataProcessing', 1500); // em ms
```

### 2. Error Logger (`errorLogger.js`)

Captura e rastreia erros não tratados automaticamente.

**Inicialização automática:**
O ErrorLogger é inicializado automaticamente no cliente e captura:

- Erros não tratados (`window.onerror`)
- Promises rejeitadas não tratadas (`unhandledrejection`)

**Uso manual:**

```javascript
import { errorLogger } from '@/logger';

// Capturar erro genérico
try {
  // código que pode falhar
} catch (error) {
  errorLogger.captureError(error, {
    component: 'UserForm',
    action: 'submit',
  });
}

// Capturar erro de API
try {
  await api.get('/users');
} catch (error) {
  errorLogger.captureApiError(error, {
    method: 'GET',
    url: '/users',
  });
}

// Capturar erro de validação
errorLogger.captureValidationError('Invalid email', {
  field: 'email',
  value: 'invalid-email',
});

// Capturar erro de autenticação
errorLogger.captureAuthError('Token expired', {
  userId: 123,
});

// Wrapper para try-catch automático
const result = await errorLogger.withErrorLogging(
  async () => {
    return await api.get('/users');
  },
  { operation: 'fetchUsers' }
);

// HOF para adicionar logging a funções
const fetchUsersWithLogging = errorLogger.wrapWithErrorLogging(fetchUsers, {
  operation: 'fetchUsers',
});
```

### 3. Performance Monitor (`performanceMonitor.js`)

Monitora performance e tempos de execução.

**Uso:**

```javascript
import { performanceMonitor } from '@/logger';

// Medir operação manualmente
performanceMonitor.start('dataProcessing');
// ... código
performanceMonitor.end('dataProcessing', {
  recordsProcessed: 1000,
});

// Medir função assíncrona
const result = await performanceMonitor.measure(
  'fetchData',
  async () => {
    return await api.get('/data');
  },
  { endpoint: '/data' }
);

// HOF para adicionar medição a funções
const fetchDataWithMetrics = performanceMonitor.wrapWithMeasurement(
  'fetchData',
  fetchData,
  { endpoint: '/data' }
);

// Logs de métricas de navegação
performanceMonitor.logNavigationMetrics();

// Logs de recursos carregados
performanceMonitor.logResourceMetrics();

// Monitorar Core Web Vitals (LCP, FID, CLS)
performanceMonitor.monitorWebVitals();
```

## Integração com API

Exemplo de integração no `api.js`:

```javascript
import axios from 'axios';
import { logger, errorLogger, performanceMonitor } from '@/logger';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log da requisição
    logger.apiRequest(config.method.toUpperCase(), config.url, config.data);

    // Inicia medição de performance
    config.metadata = { startTime: performance.now() };

    return config;
  },
  (error) => {
    errorLogger.captureError(error, { type: 'requestInterceptor' });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calcula duração
    const duration = performance.now() - response.config.metadata.startTime;

    // Log da resposta
    logger.apiResponse(
      response.config.method.toUpperCase(),
      response.config.url,
      response.status,
      response.data
    );

    // Log de performance
    logger.performance(
      `API ${response.config.method.toUpperCase()} ${response.config.url}`,
      Math.round(duration)
    );

    return response;
  },
  (error) => {
    // Captura erro
    errorLogger.captureApiError(error, error.config);

    return Promise.reject(error);
  }
);

export default api;
```

## Integração com Componentes

Exemplo em componente React:

```javascript
import { useEffect } from 'react';
import { logger, errorLogger, performanceMonitor } from '@/logger';

function UserList() {
  useEffect(() => {
    async function loadUsers() {
      performanceMonitor.start('loadUsers');

      try {
        const response = await api.get('/users');

        logger.info('Users loaded', {
          count: response.data.length,
        });

        performanceMonitor.end('loadUsers', {
          usersLoaded: response.data.length,
        });
      } catch (error) {
        errorLogger.captureError(error, {
          component: 'UserList',
          action: 'loadUsers',
        });
      }
    }

    loadUsers();
  }, []);

  return <div>...</div>;
}
```

## Integração com Services Externos

### Sentry

```javascript
// 1. Instalar Sentry
npm install @sentry/nextjs

// 2. Configurar no _app.js ou sentry.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// 3. O errorLogger vai detectar e usar automaticamente
// Descomente as linhas no logger.js e errorLogger.js
```

### LogRocket

```javascript
// 1. Instalar LogRocket
npm install logrocket

// 2. Configurar no _app.js
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');

// 3. O logger vai detectar e usar automaticamente
// Descomente as linhas no logger.js
```

## Variáveis de Ambiente

Adicione no `.env.local`:

```bash
# Logs em produção (padrão: desabilitado)
NEXT_PUBLIC_ENABLE_LOGS=false

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# LogRocket (opcional)
NEXT_PUBLIC_LOGROCKET_APP_ID=your-logrocket-id
```

## Melhores Práticas

1. **Use o nível correto:**
   - `debug`: Informações técnicas detalhadas (dev only)
   - `info`: Eventos importantes do sistema
   - `warn`: Problemas não críticos
   - `error`: Erros que precisam atenção

2. **Sempre inclua contexto:**

   ```javascript
   // ❌ Ruim
   logger.error('Failed');

   // ✅ Bom
   logger.error('Failed to save user', {
     userId: 123,
     reason: 'Validation error',
     fields: ['email'],
   });
   ```

3. **Capture erros com stack trace:**

   ```javascript
   try {
     // código
   } catch (error) {
     logger.errorWithStack('Operation failed', error, context);
   }
   ```

4. **Monitore performance de operações lentas:**

   ```javascript
   performanceMonitor.measure('heavyOperation', async () => {
     // operação pesada
   });
   ```

5. **Use wrappers para funções críticas:**
   ```javascript
   const safeFunction = errorLogger.wrapWithErrorLogging(riskyFunction, {
     context: 'important',
   });
   ```

## Exemplos Práticos

### Formulário com Logging

```javascript
async function handleSubmit(data) {
  logger.userAction('form_submit', { form: 'userRegistration' });

  performanceMonitor.start('userRegistration');

  try {
    const response = await errorLogger.withErrorLogging(
      () => api.post('/users', data),
      { operation: 'createUser', data }
    );

    logger.info('User registered successfully', {
      userId: response.data.id,
    });

    performanceMonitor.end('userRegistration', {
      success: true,
    });

    return response.data;
  } catch (error) {
    performanceMonitor.end('userRegistration', {
      success: false,
    });
    throw error;
  }
}
```

### Dashboard com Métricas

```javascript
useEffect(() => {
  // Monitora Web Vitals
  performanceMonitor.monitorWebVitals();

  // Loga métricas de navegação
  performanceMonitor.logNavigationMetrics();

  // Loga recursos carregados
  performanceMonitor.logResourceMetrics();
}, []);
```

## Troubleshooting

**Logs não aparecem em produção:**

- Verifique `NEXT_PUBLIC_ENABLE_LOGS=true` no `.env`
- Configure serviços externos (Sentry, LogRocket)

**Performance Observer não funciona:**

- Verifique suporte do navegador
- Use feature detection antes de usar

**Muitos logs no console:**

- Use `logger.debug()` para logs detalhados
- Em produção, apenas `info`, `warn` e `error` são enviados para serviços externos
