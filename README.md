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

## Papéis e navegação

| Papel | Menu |
|-------|------|
| **RH** | Dashboard, Colaboradores, Times, Avaliações, Templates, Configurações |
| **Gerente** | Dashboard, Minha Equipe, Avaliações |
| **Funcionário** | Dashboard, Minhas Avaliações, Autoavaliação, Meu Perfil |

Permissões centralizadas em:

- Backend: `backend/src/auth/` + middleware `authorize`
- Frontend: `frontend/src/auth/` + `RoleGuard` / `usePermissions`

## Credenciais do seed

Senha padrão para **todos**: `123456`

| E-mail | Papel | Observação |
|--------|-------|------------|
| `rh1@empresa.com` | RH | Acesso total |
| `rh2@empresa.com` | RH | Acesso total |
| `gerente.a@empresa.com` | Gerente | Time A (func. 01–10) |
| `gerente.b@empresa.com` | Gerente | Time B (func. 11–20) |
| `gerente.c@empresa.com` | Gerente | Time C (func. 21–30) |
| `funcionario01@empresa.com` … `funcionario30@empresa.com` | Funcionário | Vinculados aos times A/B/C |

O seed também cria avaliações concluídas, pendentes e autoavaliações com notas variadas (2–5).

> Reexecutar `npm run db:seed` **apaga** usuários/colaboradores/times/avaliações e recria o cenário de demonstração (templates são preservados se já existirem).

## API (resumo)

| Prefixo | Descrição |
|---------|-----------|
| `/api/auth` | Login e perfil |
| `/api/dashboard` | Stats por papel |
| `/api/employees` | Colaboradores (escopo por papel) |
| `/api/teams` | Times (RH) |
| `/api/templates` | Templates de avaliação |
| `/api/evaluations` | Avaliações + `POST /self` (autoavaliação) |

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe frontend e backend |
| `npm run dev:backend` | Apenas API |
| `npm run dev:frontend` | Apenas frontend |
| `npm run db:migrate` | Executa migrations Prisma |
| `npm run db:seed` | Popula cenário completo de demonstração |

## Funcionalidades

- Autenticação JWT + RBAC (RH / Gerente / Funcionário)
- Times com membros e gerentes
- Escopo de dados por papel
- Autoavaliação (`isAutoEvaluation`)
- Dashboards por papel
- Wizard de avaliação
- CRUD de colaboradores e avaliações

## Deploy em produção

Veja o guia completo em **[DEPLOY.md](./DEPLOY.md)**.

- **Frontend** → Vercel
- **Backend** → Railway ou Render
- **PostgreSQL** → Neon ou Railway Postgres
