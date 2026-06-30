# Deploy em produção

Guia para hospedar o sistema com **Vercel (frontend)**, **Railway ou Render (backend)** e **Neon ou Railway (PostgreSQL)**.

## Arquitetura recomendada

```
┌─────────────┐      HTTPS       ┌──────────────────┐      ┌─────────────────┐
│   Vercel    │  ──────────────► │ Railway / Render │ ───► │ Neon / Railway  │
│  (React)    │   API REST       │  (Express API)   │      │  (PostgreSQL)   │
└─────────────┘                  └──────────────────┘      └─────────────────┘
```

| Camada | Serviço sugerido | Por quê |
|--------|------------------|---------|
| **Frontend** | [Vercel](https://vercel.com) | Deploy automático, CDN global, ótimo para Vite/React |
| **Backend** | [Railway](https://railway.app) ou [Render](https://render.com) | API Express precisa de processo Node contínuo |
| **Banco** | [Neon](https://neon.tech) ou Postgres do Railway | PostgreSQL gerenciado, backups, SSL |

### Por que não colocar tudo na Vercel?

A Vercel é excelente para sites estáticos e serverless, mas este backend é um **servidor Express tradicional** com Prisma e conexão persistente ao Postgres. Rodar isso na Vercel exigiria refatorar para funções serverless — não vale a pena neste projeto.

---

## Opção A — Recomendada (Vercel + Railway + Neon)

Melhor custo/benefício e separação clara de responsabilidades.

### 1. Banco de dados (Neon)

1. Crie um projeto em [neon.tech](https://neon.tech)
2. Copie a connection string (formato `postgresql://...`)
3. Se necessário, adicione `?sslmode=require` ao final da URL

Exemplo:

```
postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/performance?sslmode=require
```

### 2. Backend (Railway)

1. Conecte o repositório GitHub ao [Railway](https://railway.app)
2. Crie um serviço apontando para a pasta **`backend/`**
3. Configure as variáveis de ambiente em **Variables** (obrigatório — o `.env` local não sobe para o Railway):

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Connection string completa do Neon (com `?sslmode=require`) |
| `JWT_SECRET` | String aleatória longa (ex.: `openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | URL do frontend (temporário: `http://localhost:5173`) |

> Se `DATABASE_URL` faltar, o log mostra: `The datasource.url property is required`

4. **Start command:**

```bash
npm run start:prod
```

Isso roda as migrations e inicia a API.

5. Rode o seed **uma vez** (via Railway shell ou localmente apontando para o Neon):

```bash
cd backend
DATABASE_URL="sua-url-neon" npm run prisma:seed
```

6. Anote a URL pública da API, ex.: `https://performance-api-production.up.railway.app`

Teste:

```bash
curl https://SUA-API.railway.app/api/health
```

### 3. Frontend (Vercel)

1. Importe o repositório em [vercel.com](https://vercel.com)
2. Configure o projeto:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

3. Variável de ambiente:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://SUA-API.railway.app/api` |

4. Deploy. A Vercel usará o `vercel.json` para rotas do React Router.

5. Volte ao Railway e atualize `CORS_ORIGIN` com a URL da Vercel:

```
https://seu-app.vercel.app
```

Para previews da Vercel, use vírgula:

```
https://seu-app.vercel.app,https://seu-app-*.vercel.app
```

> O backend aceita múltiplas origens separadas por vírgula em `CORS_ORIGIN`.

---

## Opção B — Tudo no Railway (mais simples)

1. **Postgres** — crie um banco no Railway
2. **Backend** — serviço na pasta `backend/`, use a `DATABASE_URL` interna do Railway
3. **Frontend** — pode usar Vercel mesmo assim (recomendado) ou servir o `dist/` via outro serviço

Vantagem: uma conta, billing unificado.  
Desvantagem: frontend sem CDN da Vercel se hospedar tudo lá.

---

## Opção C — Render (alternativa ao Railway)

### Backend (Web Service)

- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm run start:prod`
- **Health Check Path:** `/api/health`

### Banco (Render PostgreSQL)

Use a **Internal Database URL** no `DATABASE_URL` do backend.

---

## Build local (validar antes do deploy)

```bash
# Frontend
cd frontend
cp .env.production.example .env.production
# Edite VITE_API_URL com a URL da API
npm run build

# Backend (testar start de produção)
cd ../backend
DATABASE_URL="sua-url" JWT_SECRET="test" CORS_ORIGIN="http://localhost:5173" npm run start:prod
```

---

## Checklist de produção

- [ ] `JWT_SECRET` forte e único (nunca usar `dev-secret`)
- [ ] `DATABASE_URL` com SSL (`?sslmode=require` no Neon)
- [ ] Migrations aplicadas (`prisma migrate deploy` — já no `start:prod`)
- [ ] Seed executado uma vez (usuário RH inicial)
- [ ] `CORS_ORIGIN` apontando para o domínio real do frontend
- [ ] `VITE_API_URL` apontando para `/api` da API em produção
- [ ] Health check respondendo: `GET /api/health`

---

## Custos estimados (tier gratuito / baixo)

| Serviço | Free tier |
|---------|-----------|
| Vercel | Sim (hobby) |
| Neon | Sim (~0.5 GB) |
| Railway | Créditos mensais limitados |
| Render | Web service free (com limitações) |

Para uso interno do RH, o free tier costuma ser suficiente no início.

---

## Domínio customizado (opcional)

- **Frontend:** Vercel → Settings → Domains → `app.suaempresa.com`
- **API:** Railway → Settings → Domains → `api.suaempresa.com`
- Atualize `VITE_API_URL` e `CORS_ORIGIN` com os novos domínios

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `datasource.url property is required` | Adicione `DATABASE_URL` nas Variables do Railway |
| CORS error no browser | Confira `CORS_ORIGIN` no backend |
| 401 em todas as rotas | Token expirado — faça login novamente |
| API não conecta ao banco | Verifique `DATABASE_URL` e SSL |
| Página em branco ao recarregar | Confirme que `vercel.json` está no `frontend/` |
| Migrations não rodaram | Use `npm run start:prod` como start command |
