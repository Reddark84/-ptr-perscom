# PTR PERSCOM — Phoenix Taskforce Rangers

Sistema de Gestão de Pessoal (PERSCOM) da comunidade portuguesa de Arma 3 **Phoenix Taskforce Rangers**.
Aplicação web instalável (PWA) para telemóvel e PC, em português, com notificações push.

![Emblema](public/icon-192.png)

---

## Funcionalidades

| Área | Descrição |
|---|---|
| **Painel** | Resumo do efectivo, próximos eventos, últimas actualizações, servidor principal, links/QR de instalação |
| **Pessoal** | Militares com patente (insígnias do Exército Português), cargo, especialidade, estado, unidade; pesquisa e filtros |
| **Perfil do militar** | Colocações, promoções, condecorações (12 medalhas), qualificações, registos de combate, presenças em eventos, documentos gerados, acesso à app |
| **Rosters** | Ordem de batalha: Roster → Unidade → militares |
| **Eventos** | Calendário de treinos, missões, operações e reuniões; briefing; presenças (Presente/Talvez/Ausente/Justificado); lembretes push |
| **Servidor** | Servidores Arma 3 / TeamSpeak / Discord com endereço, porta, password, modpack e botão *Ligar via Steam* |
| **Estatísticas** | Visão geral (gráficos por período) e tabela de progresso por operador (assiduidade, pontuação, etc.) |
| **Actualizações** | Registo automático de todas as alterações, com notificação push a todos os efectivos |
| **Avisos** | Envio de avisos gerais e histórico de notificações |
| **Candidaturas** | Formulário público de alistamento configurável; aprovação cria o militar automaticamente |
| **Documentos** | Modelos com `{{placeholders}}` (ordens de promoção, certificados…) gerados a partir do perfil, imprimíveis |
| **Configuração** | Patentes, cargos, especialidades, estados, unidades, rosters, condecorações, qualificações |
| **Acessos** | Perfis *Comando* / *Operador c/ permissão* / *Operador*; registo público com aprovação do Comando |
| **Publicar** | Guia interactivo e exportação do projecto para colocar a app num endereço permanente |

### Perfis de acesso

- **Comando** — acesso total e gestão de permissões. Conta principal: login `comando`, password `REDPTR2026` (alterável por `COMANDO_PASSWORD`).
- **Operador c/ permissão** — pode alterar registos, agendar eventos, enviar avisos.
- **Operador** — apenas consulta e marcação da própria presença.

Os efectivos criam conta em **/registo**; ficam pendentes até o Comando aprovar em *Configuração → Acessos e permissões*.

---

## Tecnologias

- **Next.js 16** (App Router, Server Actions, Route Handlers) · **React 19** · **TypeScript**
- **PostgreSQL** via **Drizzle ORM**
- **Tailwind CSS 4**
- **Web Push** (VAPID) para notificações · **PWA** (manifesto + service worker)
- Insígnias e medalhas em SVG geradas por `scripts/gerar-insignias.mjs`

---

## Executar localmente

Requisitos: Node.js 22+ e PostgreSQL 14+.

```bash
npm install
cp .env.example .env          # edita DATABASE_URL
npm run dev                   # http://localhost:3000
```

No primeiro arranque a app **cria as tabelas, os dados iniciais e a conta `comando`** automaticamente.

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run db:push` | Aplicar o esquema com drizzle-kit (opcional — a app faz isto sozinha) |
| `npm run db:seed` | Semear dados iniciais manualmente |
| `npm run insignias` | Regenerar SVGs de patentes e medalhas em `public/` |
| `npm run typecheck` | Verificação TypeScript |

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Ligação PostgreSQL (com `?sslmode=require` em serviços externos) |
| `NEXT_PUBLIC_APP_URL` | Recomendada | Endereço público — usado em links, QR e notificações |
| `COMANDO_PASSWORD` | Recomendada | Password da conta `comando` (por defeito `REDPTR2026`) |
| `AUTH_SECRET` | Recomendada | Segredo de assinatura das sessões (`openssl rand -base64 32`) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Não | Geradas automaticamente se omitidas |
| `VAPID_SUBJECT` | Não | Contacto do emissor das notificações |

---

## Publicar com endereço permanente

Ver **[PUBLICAR.md](PUBLICAR.md)** — opções gratuitas: **Vercel + Neon** (recomendado), **Render** (`render.yaml` incluído), **Railway**, ou **Docker** num servidor próprio (`docker compose up -d --build`).

Dentro da app: *Configuração → Publicar (endereço fixo)* tem o guia interactivo.

---

## Estrutura do projecto

```
src/
├── app/
│   ├── (app)/                 Área autenticada (layout com menu)
│   │   ├── page.tsx           Painel
│   │   ├── pessoal/           Lista, novo, perfil ([id]) e edição
│   │   ├── rosters/           Ordem de batalha
│   │   ├── eventos/           Calendário, detalhe, novo, editar
│   │   ├── estatisticas/      Visão geral e operadores
│   │   ├── servidor/          Informação de servidores (com gestão inline)
│   │   ├── actualizacoes/     Registo de alterações
│   │   ├── avisos/            Notificações enviadas + aviso geral
│   │   ├── candidaturas/      Revisão de candidaturas
│   │   ├── documentos/        Modelos de documentos
│   │   ├── formularios/       Editor de formulários
│   │   ├── instalar/          QR e instruções (+ cartaz imprimível)
│   │   ├── conta/             Sessão e password do utilizador
│   │   └── admin/             Catálogos ([slug]), acessos, publicar
│   ├── login/  registo/  app/  alistamento/   Páginas públicas
│   ├── api/
│   │   ├── auth/              login, logout, sessao, eu
│   │   ├── push/              vapid, subscribe, test
│   │   ├── exportar-projecto/ ZIP do código (Comando)
│   │   └── health/
│   ├── layout.tsx  globals.css  manifest.ts
├── components/                UI, navegação, gráficos, formulários, PWA
├── db/
│   ├── schema.ts              Esquema Drizzle (25 tabelas)
│   ├── esquema-sql.ts         SQL idempotente gerado do esquema
│   ├── migrar.ts              Garante o esquema no arranque
│   ├── seed.ts                Dados iniciais + sincronização
│   └── index.ts               Cliente da BD
├── lib/
│   ├── actions.ts             Server actions (todas protegidas por permissão)
│   ├── auth.ts / auth-actions.ts   Sessões, passwords, perfis, registo
│   ├── auditoria.ts           Registo de alterações + notificação automática
│   ├── push.ts                Web Push
│   ├── estatisticas.ts        Consultas de estatísticas
│   ├── patentes.ts            Hierarquia oficial do Exército Português
│   ├── catalogos.ts           Configuração dos catálogos CRUD
│   └── format.ts / eventos.ts / app-url.ts
├── proxy.ts                   Porteiro de rotas (sessão obrigatória)
└── instrumentation.ts         Arranque: esquema, seed, conta de Comando
public/
├── emblema.png, icon-*.png    Emblema e ícones PWA
├── patentes/*.svg             24 insígnias
├── medalhas/*.svg             12 medalhas
└── sw.js                      Service worker (push + cache)
scripts/gerar-insignias.mjs    Gerador de SVGs
Dockerfile, docker-compose.yml, render.yaml, railway.json, vercel.json
```

---

## Modelo de dados (resumo)

```
users ─┬─ rank, position, specialty, status, unit (FK)
       ├─ assignments[]  promotions[]  user_awards[]  user_qualifications[]
       ├─ combat_records[]  user_documents[]  event_attendance[]
       └─ login / password_hash / role / conta_estado
rosters ─ units ─ users
events ─ event_attendance
documents (templates)   forms (campos JSON)   enlistment_applications
audit_log   notifications   push_subscriptions   servers   app_settings
```

---

## Licença

Uso interno da comunidade Phoenix Taskforce Rangers.
