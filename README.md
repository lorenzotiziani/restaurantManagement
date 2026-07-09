# restaurantManagement

Gestionale per pizzeria: ordini, consegne, gestione fattorini, menu, ingredienti e pagamenti.
Progetto personale in **fase embrionale** — vedi [roadmap.md](roadmap.md) per la direzione.

---

## Stack

| Livello | Tecnologie |
|---------|-----------|
| **Backend** | NestJS 11, Prisma 7 (PostgreSQL via `@prisma/adapter-pg`), Zod + `nestjs-zod` per la validazione, JWT (access + refresh), bcrypt, passport-jwt |
| **Frontend** | Angular (porta 4200), `jwtDecode` per decodificare il token |
| **Database** | PostgreSQL |

---

## Struttura del backend (`backend/src/`)

| Modulo | Percorso | Responsabilità |
|--------|----------|----------------|
| Auth | `auth/` | register, login, logout, refresh token |
| User | `user/` | CRUD utenti |
| Prenotazioni | `prenotazioni/` | ordini/consegne (entità principale) |
| Ruoli | `shared/ruoli/` | CRUD ruoli (forno, cassa, fattorino, banco) |
| Ingredienti | `shared/ingrediente/` | CRUD ingredienti |
| MenuItems | `shared/menuItems/` | CRUD piatti del menu |
| FasceOrarie | `shared/fasceOrarie/` | slot temporali con capacità max ordini |
| Pagamento | `shared/pagamento/` | conferma pagamento su una prenotazione |
| Common | `common/` | guard (`RolesGuard`), decoratori (`@Roles`), pipe, filtri |

### Modello dati (Prisma)

- `Ruolo` → `User` (1:N) — ruoli: **forno, cassa, fattorino, banco**
- `User` → `Prenotazione` (1:N via `fattorinoId`) — fattorino assegnato
- `Prenotazione` → `OrdineItem` → `OrdineItemAggiunta` / `OrdineItemRimozione`
- `Prenotazione` → `Pagamento`
- `MenuItem` → `MenuItemIngredienti` → `Ingrediente`
- Snapshot di nome/prezzo/categoria in `OrdineItem` (storicizzazione prezzi)
- Vista `UtenteRuoloView` — join User+Ruolo

**Enum:**
- `StatoPrenotazione`: `RICEVUTA → IN_LAVORAZIONE → PRONTA → IN_CONSEGNA → CONSEGNATA | ANNULLATA`
- `ModalitaConsegna`: `ASPORTO | DOMICILIO`
- `MetodoPagamento`: `CONTANTI | CARTA | ONLINE`

---

## Autenticazione e autorizzazione

### JWT
- **Access token** (`JWT_SECRET`, scadenza `JWT_EXPIRES_IN`) inviato come `Authorization: Bearer <token>`.
- **Refresh token** (`JWT_REFRESH_SECRET`, scadenza `JWT_REFRESH_EXPIRES_IN`) persistito in tabella `RefreshToken`, ruotato ad ogni refresh.
- Payload del token:
  ```ts
  { userId, email, nome, cognome, ruoloId, ruolo }
  ```
  `ruolo` è il **nome** del ruolo (es. `"cassa"`), usato dal controllo di autorizzazione.

### RBAC (role-based access control)
Il controllo dei ruoli si basa sul **nome del ruolo** presente nel JWT.

- `@Roles('cassa', ...)` — decoratore ([common/decorators/roles.decorator.ts](backend/src/common/decorators/roles.decorator.ts)) che marca una rotta o un intero controller.
- `RolesGuard` — guard ([common/guards/roles.guard.ts](backend/src/common/guards/roles.guard.ts)) che legge il ruolo dal JWT. **Se una rotta non ha `@Roles`, resta accessibile a qualsiasi utente autenticato**; altrimenti richiede uno dei ruoli indicati.
- Va sempre dopo `AuthGuard('jwt')`: `@UseGuards(AuthGuard('jwt'), RolesGuard)`.

> **Nota:** attualmente **`cassa` è il ruolo "gestore"** (la Lisa della roadmap). Non esiste ancora un ruolo `admin` dedicato: se in futuro serve, sarà un cambio mirato.

---

## Endpoint principali

Legenda ruoli: 🔓 pubblico · 🔑 autenticato · 🧑‍💼 solo `cassa`

### Auth (`/auth`)
| Metodo | Rotta | Accesso |
|--------|-------|---------|
| POST | `/auth/register` | 🔓 |
| POST | `/auth/login` | 🔓 |
| POST | `/auth/logout` | 🔓 |

### User (`/user`)
| Metodo | Rotta | Accesso |
|--------|-------|---------|
| GET | `/user` | 🔑 |
| GET | `/user/id/:id` | 🔑 |
| PATCH | `/user/:id` | 🔑 **self** — solo `cassa` può modificare altri utenti o cambiare `ruoloId`; password ri-hashata su update |
| DELETE | `/user/:id` | 🧑‍💼 |

### Ingredienti (`/ingrediente`) e Menu (`/menu-items`)
| Metodo | Rotta | Accesso |
|--------|-------|---------|
| GET | `/…` | 🔑 |
| POST / PATCH / DELETE | `/…` | 🧑‍💼 |

### Ruoli (`/ruoli`)
| Metodo | Rotta | Accesso |
|--------|-------|---------|
| GET / POST / PATCH / DELETE | `/ruoli` | 🧑‍💼 |

### Prenotazioni (`/prenotazioni`)
| Metodo | Rotta | Accesso |
|--------|-------|---------|
| GET | `/prenotazioni`, `/getHistory`, `/lastReservation`, `/fasce-orarie/available`, `/:id` | 🔑 |
| POST | `/prenotazioni` (crea ordine) | 🔑 |
| PATCH | `/pagamento/update` | 🔑 |
| PATCH | `/:id/stato` (transizione stato) | 🔑 — ruolo abilitato **secondo la transizione** (vedi sotto) |
| POST | `/assegnaFattorino` | 🧑‍💼 |
| PATCH | `/:id` (modifica dettagli, non lo stato) | 🧑‍💼 |
| DELETE | `/:id` (soft delete → `ANNULLATA`) | 🧑‍💼 |

#### Macchina a stati delle prenotazioni
Le transizioni di stato passano **solo** da `PATCH /:id/stato`, che valida la transizione e il ruolo. `cassa` può eseguire qualsiasi transizione valida.

| Da → A | Ruolo abilitato |
|--------|-----------------|
| `RICEVUTA` → `IN_LAVORAZIONE` | forno |
| `IN_LAVORAZIONE` → `PRONTA` | forno |
| `PRONTA` → `IN_CONSEGNA` | fattorino, banco |
| `IN_CONSEGNA` → `CONSEGNATA` | fattorino |
| *(stato attivo)* → `ANNULLATA` | cassa |
| `CONSEGNATA`, `ANNULLATA` | stati finali (nessuna transizione) |

---

## Avvio in locale

```bash
cd backend
npm install
npx prisma migrate dev      # applica le migration
npm run start:dev           # avvia in watch mode (default: porta 3000)
```

### Variabili d'ambiente (`backend/.env`)

| Variabile | Descrizione |
|-----------|-------------|
| `DATABASE_URL` | connection string PostgreSQL |
| `JWT_SECRET` | segreto per l'access token |
| `JWT_EXPIRES_IN` | scadenza access token (es. `15m`) |
| `JWT_REFRESH_SECRET` | segreto per il refresh token |
| `JWT_REFRESH_EXPIRES_IN` | scadenza refresh token (es. `7d`) |
| `FRONTEND_URL` | origin consentito per la CORS (default `http://localhost:4200`) |
| `PORT` | porta del backend (default `3000`) |

> ⚠️ **Seed ruoli:** i ruoli (`forno`, `cassa`, `fattorino`, `banco`) vanno inseriti manualmente nel DB — non esiste ancora uno script di seed.

---

## Stato di sviluppo

### ✅ Fatto
- Autenticazione JWT con access + refresh token (rotazione del refresh)
- Registrazione/login/logout, hashing password con bcrypt (create **e** update)
- CRUD: utenti, ruoli, ingredienti, menu items, prenotazioni
- Fasce orarie con calcolo disponibilità (`/fasce-orarie/available`)
- **RBAC**: `@Roles` + `RolesGuard` sui controller (gestione riservata a `cassa`)
- **RBAC prenotazioni per stato**: macchina a stati con ruoli abilitati per transizione (forno/fattorino/banco/cassa)
- **Soft delete** prenotazioni (stato `ANNULLATA`, escluse dalla lista)
- **Refresh token multi-device** (sessioni multiple; login e refresh non revocano gli altri device)
- Protezione contro privilege escalation su `/user` (self vs `cassa`)
- CORS configurabile via env

### 🔜 Da fare (per completare la roadmap)
- **Menu filtrabile** per categoria (bevande / fritti / pizze) tramite parametro in richiesta
- **Gestione consegne** collegata alle prenotazioni (flusso fattorino)
- **Gestione ordine** completa (comporre/modificare gli item di una prenotazione)
- **Seed** iniziale (ruoli e dati di base)
- **Paginazione** sulle liste (`findAll`)
- **Test** (attualmente solo stub auto-generati)

### 💡 Idee future
Notifiche real-time (WebSocket), dashboard per ruolo, gestione disponibilità fattorini,
magazzino/scorte ingredienti, pagamenti online (Stripe/Satispay), notifiche cliente (SMS/email),
reportistica, audit log, rate limiting sul login, ordinazione via AI/NLP.
