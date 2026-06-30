# Sistema de Avaliação de Performance

Monorepo com frontend (React 19 + Vite) e backend (Node.js + Express + Prisma + PostgreSQL).

## Pré-requisitos

- Node.js 20+ (recomendado: 22)
- Docker e Docker Compose

## Estrutura

```
performance/
├── backend/          # API REST
├── frontend/         # Interface React
├── docker-compose.yml
└── package.json      # Scripts do monorepo
```

### 1. Subir o banco de dados

O container PostgreSQL expõe a porta **5433** (a 5432 local costuma já estar em uso).

```bash
npm run db:up
```

### 2. Configurar variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Instalar dependências

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4. Migrar e popular o banco

```bash
npm run db:migrate
npm run db:seed
```

### 5. Iniciar frontend e backend

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health

## Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login com e-mail e senha |
| GET | `/api/auth/me` | Dados do usuário autenticado (requer JWT) |

### Colaboradores (requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/employees` | Lista paginada com busca e filtros |
| GET | `/api/employees/:id` | Detalhe do colaborador |
| GET | `/api/employees/:id/history` | Histórico de avaliações |
| POST | `/api/employees` | Criar colaborador |
| PUT | `/api/employees/:id` | Atualizar colaborador |
| DELETE | `/api/employees/:id` | Excluir colaborador |

### Dashboard (requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/stats` | Métricas e avaliações recentes |

### Avaliações (requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/templates` | Templates ativos |
| GET | `/api/templates/:id` | Template com categorias e perguntas |
| GET | `/api/evaluations` | Lista paginada |
| POST | `/api/evaluations` | Criar rascunho |
| GET | `/api/evaluations/:id` | Detalhe completo |
| GET | `/api/evaluations/:id/summary` | Resumo calculado |
| PUT | `/api/evaluations/:id` | Salvar progresso |
| POST | `/api/evaluations/:id/complete` | Concluir avaliação |
| DELETE | `/api/evaluations/:id` | Excluir rascunho |

## Credenciais iniciais (seed)

- **E-mail:** rh@empresa.com
- **Senha:** admin123

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe frontend e backend |
| `npm run dev:backend` | Apenas API |
| `npm run dev:frontend` | Apenas frontend |
| `npm run db:migrate` | Executa migrations Prisma |
| `npm run db:seed` | Popula usuário RH e template padrão |

## Funcionalidades implementadas

- Autenticação JWT
- CRUD de colaboradores
- Fluxo de avaliação em etapas (wizard)
- Dashboard com métricas reais

## Deploy em produção

Veja o guia completo em **[DEPLOY.md](./DEPLOY.md)**.

Resumo da arquitetura recomendada:

- **Frontend** → Vercel
- **Backend** → Railway ou Render
- **PostgreSQL** → Neon ou Railway Postgres
