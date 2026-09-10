# PTR PERSCOM — Guia de Publicação

Este guia explica como colocar a app **online com endereço próprio**, para que qualquer efectivo a abra no Chrome (telemóvel ou PC) e a instale no ecrã inicial, **sem depender do ambiente Arena**.

> Requisitos comuns: a app precisa de **HTTPS** (para instalação PWA e notificações push) e de uma base de dados **PostgreSQL**.

---

> **Sem linha de comandos?** Dentro da app, em **Configuração → Publicar (endereço fixo)**, tens o guia interactivo, o botão para descarregar o projecto em ZIP e os valores para copiar.

## Opção 1 — Vercel + Neon (grátis, recomendado, ~10 minutos)

1. **Código no GitHub**
   - Cria um repositório privado (ex.: `ptr-perscom`) em github.com/new.
   - Descarrega o ZIP do projecto (app → Publicar) ou usa esta pasta, e envia o conteúdo com **"uploading an existing file"** (arrastar e largar) ou com `git push`.

2. **Base de dados grátis (Neon)**
   - Vai a <https://neon.tech> → *New Project* → nome `ptr-perscom` → região *Europe (Frankfurt)*.
   - Copia a **connection string** (`postgresql://...neon.tech/neondb?sslmode=require`).

3. **Esquema da base de dados** — não é preciso fazer nada: a app cria e actualiza as tabelas sozinha no primeiro arranque, junto com os dados iniciais e a conta `comando`.

4. **Publicar na Vercel**
   - <https://vercel.com> → *Add New Project* → importa o repositório.
   - Em **Environment Variables** adiciona:
     | Nome | Valor |
     |---|---|
     | `DATABASE_URL` | a connection string do Neon |
     | `NEXT_PUBLIC_APP_URL` | `https://ptr-perscom.vercel.app` (ou o teu domínio) |
     | `COMANDO_PASSWORD` | `REDPTR2026` (muda-a depois) |
     | `AUTH_SECRET` | um texto longo e aleatório |
   - *Deploy*. Em ~2 minutos tens a app em `https://ptr-perscom.vercel.app`.

5. **Domínio próprio (opcional)** — em *Settings → Domains* adiciona `perscom.ptr-rangers.pt` e cria o CNAME indicado no teu DNS. Actualiza `NEXT_PUBLIC_APP_URL`.

6. **Partilhar** — abre `/instalar` na app publicada: os links e os QR (telemóvel e PC) já apontam para o endereço definitivo. Imprime o cartaz em `/instalar/cartaz`.

---

## Opção 2 — Docker num VPS próprio (Hetzner, OVH, Contabo…)

```bash
git clone <o-teu-repositório> ptr-perscom && cd ptr-perscom
export NEXT_PUBLIC_APP_URL=https://perscom.ptr-rangers.pt
docker compose up -d --build
```

- Sobe **PostgreSQL + app** em `http://IP:3000`. O esquema é aplicado automaticamente no arranque.
- Para HTTPS, coloca um reverse proxy à frente (ex.: **Caddy** — 3 linhas de configuração e certificados automáticos):
  ```
  perscom.ptr-rangers.pt {
      reverse_proxy localhost:3000
  }
  ```

---

## Opção 3 — Render / Railway (1 clique, ficheiros incluídos)

- **Render**: *Blueprints → New Blueprint Instance* → escolhe o repositório. O `render.yaml` incluído cria a app e a base de dados PostgreSQL (plano grátis) com todas as variáveis.
- **Railway**: *New Project → Deploy from GitHub* + *Add PostgreSQL*. Define `DATABASE_URL=${{Postgres.DATABASE_URL}}` e `NEXT_PUBLIC_APP_URL`. Build: `npm run build`; Start: `npm run db:push && npm start`.
- **Render**: *Web Service* (Node) + *PostgreSQL*. Mesmas variáveis; *Build Command* `npm install && npm run build`; *Start Command* `npm run db:push && npm start`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Ligação PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | Recomendada | Endereço público, usado nos links/QR |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Não | Se omitidas, são geradas e guardadas na BD |
| `VAPID_SUBJECT` | Não | Contacto do emissor das notificações |
| `COMANDO_PASSWORD` | Recomendada | Password da conta principal `comando` (por defeito `REDPTR2026`) |
| `AUTH_SECRET` | Recomendada | Segredo de assinatura das sessões (ex.: `openssl rand -base64 32`). Se omitida, é gerada e guardada na BD; com ela definida, o porteiro de rotas valida as sessões criptograficamente. |

## Primeiro acesso e permissões

1. A conta principal de Comando é criada automaticamente no arranque: login **`comando`** e a password definida em `COMANDO_PASSWORD` (por defeito `REDPTR2026`). Muda-a em produção definindo a variável.
2. Os efectivos criam a sua própria conta em **/registo** (link disponível em *Acessos e permissões*); o registo fica **pendente** até o Comando aprovar e escolher o perfil.
3. Em **Configuração → Acessos e permissões** (ou no separador **Acesso** de cada militar) cria logins para os restantes efectivos e escolhe o perfil:
   - **Comando** — acesso total e gestão de permissões (tu e quem designares);
   - **Operador c/ permissão** — pode alterar registos e agendar eventos;
   - **Operador** — apenas consulta e marcação da própria presença.
4. Todas as alterações ficam registadas em **Actualizações** e são enviadas automaticamente por notificação a todos os efectivos subscritos.

## Comandos úteis

```bash
npm run db:push     # aplicar/actualizar esquema da base de dados
npm run db:seed     # semear dados iniciais manualmente (é automático no arranque)
npm run insignias   # regenerar SVGs de patentes e medalhas em public/
```

## Notas

- **Notificações push** só funcionam em HTTPS e, no iPhone, apenas depois de a app ser adicionada ao ecrã principal (iOS 16.4+).
- O ficheiro `.env` local (`DATABASE_URL` para o Postgres local) não deve ser enviado para o repositório — usa `.env.example` como modelo.
