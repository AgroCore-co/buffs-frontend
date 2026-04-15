---
name: frontend-data-layer
description: Create production-grade data fetching layers for React applications using TanStack React Query and Axios. Use this skill when the user asks to build API integrations, services, CRUD operations, or hooks for fetching/mutating data. Generates robust, strictly typed code following a strict separation of concerns, the Facade pattern, and extensive documentation.
license: Complete terms in LICENSE.txt
---

This skill guides the creation of a robust, scalable frontend data layer. You must strictly follow the project's architectural pattern, separating API calls into a "Service" file and state management into a "Hook" file using TanStack React Query.

The user will provide a domain, endpoint, or entity (e.g., "Users", "Products") to build the data layer for.

## Core Architectural Rules

1. **The API Client is Sacred**: ALL API calls MUST use the custom Axios instance. You must always import it exactly as: `import apiClient from '@/lib/apiClient';`. NEVER use native `fetch` or a raw `axios` import.
2. **Strict Separation of Concerns**:
   - **Service File (`[domain].service.ts`)**: Exclusively handles DTO definitions, payload formatting, and API calls returning Promises. Absolutely NO React code or hooks here.
   - **Hook File (`use[Domain].ts`)**: Exclusively handles TanStack React Query (`useQuery`, `useMutation`, `useQueryClient`), cache manipulation, and exposes methods/state to UI components. NO raw HTTP requests here.
3. **Visual Organization**: Use explicit visual banners to separate sections in both files (e.g., `// ==========================================\n// SECTION NAME\n// ==========================================`).

## 1. The Service File Pattern (`[domain].service.ts`)

When generating a service, follow this strict structure:
- **DTOs (Data Transfer Objects)**: Define strict TypeScript interfaces for all request payloads (`Create[Entity]DTO`) and responses (`[Entity]Response`). Group them at the top under a DTOs banner.
- **Service Object**: Export ONE single constant object named `[domain]Service` containing asynchronous methods for each endpoint.
- **Implementation**: Each method must take typed arguments, call `apiClient.get/post/put/delete`, and return `response.data`.

## 2. The React Query Hook Pattern (`use[Domain].ts`)

When generating a hook, follow this strict structure:
- **Imports**: Import `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`. Import the service and DTOs from `@/services/[domain].service`.
- **Query Keys Object**: Define and export a single constant object grouping all query keys at the top (e.g., `export const [DOMAIN]_QUERY_KEYS = { all: ['domain'] as const, details: (id: string) => ['domain', id] as const };`).
- **Hook Definition (The Facade Pattern)**: Export **ONE SINGLE custom hook** named `use[Domain](options?)`. Do NOT split the logic into multiple small hooks. This hook acts as an orchestrator for the entire domain.
- **Queries & Mutations**: Group all `useQuery` calls under a `// QUERIES` banner and `useMutation` calls under a `// MUTATIONS` banner.
- **Cache Management**: On successful mutations (`onSuccess` or `onSettled`), explicitly update or invalidate the cache using `queryClient.invalidateQueries({ queryKey: [DOMAIN]_QUERY_KEYS.key })` to ensure UI reactivity.
- **Return Object**: Return a single, clean, destructured object exposing Data states, Loading states, Mutation actions, and Mutation loading states.

## 3. Documentation & Commenting Style (CRITICAL)

You MUST extensively comment the generated code in **Portuguese (PT-BR)** to explain the *intent* and *mechanics* behind the code.
- **Service File**: Use JSDoc block comments (`/** ... */`) above every single API method inside the service object to explain what the endpoint does, required roles, or specific behaviors.
- **Hook File**: Use inline comments (`// ...`) to explain *why* specific cache invalidations happen, what a mutation does, what the returned state represents, and why certain `staleTime` values are chosen. 
- **Example of expected commenting depth**: 
  `// Invalida a lista geral e o cache específico desse usuário para refletir a edição na UI`
  `// Independente de sucesso ou erro, limpamos o estado localmente para garantir a segurança`

## Code Style & Execution

- Always use the object syntax for TanStack React Query v5 (e.g., `useQuery({ queryKey: [...], queryFn: ... })`).
- Assume the backend responses are standardized and the `apiClient` already handles token injection and refresh logic (401 errors). Do NOT reinvent authentication logic.
- Ensure the code is strictly typed, avoiding `any`.