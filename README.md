# Projektuppgift – Backend-baserad webbutveckling, ADMIN

Detta är en admin-applikation byggd med HTML, CSS och JavaScript. Applikationen fungerar som administrationsgränssnittet för det fiktiva restaurangföretaget **Forno Nero** och konsumerar ett REST API byggt i Node.js/Express.

Admin-delen är kopplad till samma backend som den publika frontend-applikationen, men är avsedd för autentiserade användare med roller (chef/admin).

Systemet fungerar som ett enklare headless CMS där administratörer kan hantera menydata och användare i realtid.

---

## Funktion

Adminapplikationen erbjuder följande funktionalitet:

- Inloggning via JWT-baserad autentisering
- Rollbaserad åtkomst (chef / admin)
- Skapande av nya menyartiklar
- Redigering av befintliga menyartiklar
- Radering av menyartiklar
- Toggling av "månadens pizza"
- Dynamisk visning av meny från backend
- Skapande av nya användare (endast chef)
- Visning och hantering av användare (endast chef)
- Logout med token-borttagning

---

## Autentisering och säkerhet

Applikationen använder JWT (JSON Web Token) för autentisering.

### Flöde:

- Vid inloggning skickas användarnamn och lösenord till backend:
  - `POST /api/auth/login`
- Backend returnerar en JWT-token
- Token sparas i `localStorage`
- Token används i alla skyddade API-anrop via `Authorization: Bearer <token>`
- Vid utloggning raderas token från `localStorage`

### Exempel (auth.js):

- `saveToken(token)` → sparar JWT
- `getToken()` → hämtar JWT
- `logout()` → rensar token och skickar användaren till login

---

## Rollbaserad åtkomst

Systemet kontrollerar användarens roll via JWT payload.

### Roller:

- **chef**
  - Full åtkomst
  - Kan skapa, redigera och radera meny
  - Kan skapa och radera användare

- **admin**
  - Kan hantera meny (CRUD)
  - Kan inte hantera användare

### Implementering:

- Token avkodas med `atob()` i frontend
- UI-element visas/döljs beroende på roll
- Extra säkerhetskontroller görs vid varje action (client-side)

---

## Admin Dashboard

Dashboarden (`dashboard.html`) består av tre huvuddelar:

### 1. Användarhantering (endast chef)

- Skapa nya användare via formulär:
  - username
  - password + confirm password
  - full name
  - phone
  - role (admin / chef)

- Lista alla användare från:
  - `GET /api/auth/users`

- Radera användare via:
  - `DELETE /api/auth/users/:id`

---

### 2. Menyhantering

Administratörer kan:

- Skapa menyobjekt:
  - titel
  - beskrivning
  - pris
  - kategori (pizza / drink)
  - bild-URL

- Redigera menyobjekt via prompt-dialoger:
  - `PUT /api/menu/:id`

- Radera menyobjekt:
  - `DELETE /api/menu/:id`

- Toggla "månadens pizza":
  - `monthly_special: true/false`

---

### 3. Dynamisk menyvisning

Menyn hämtas från backend:

- `GET http://localhost:5000/api/menu`

Data delas upp i:

- Pizzor
- Drycker

Renderas dynamiskt i DOM med JavaScript.

---

## API-kommunikation

Frontend kommunicerar med backend via Fetch API.

### Exempel endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/users`
- `DELETE /api/auth/users/:id`
- `GET /api/menu`
- `POST /api/menu`
- `PUT /api/menu/:id`
- `DELETE /api/menu/:id`

Alla skyddade endpoints kräver:


Authorization: Bearer <token>


---

## UI och design

- Mörkt tema med restaurangestetik
- Responsivt layoutsystem (CSS Grid + Flexbox)
- Separat styling för:
  - login-sida
  - dashboard
  - formulär
  - menykort

### Viktiga UI-element:

- Dashboard header med logout
- Formulär för CRUD-operationer
- Dynamiska kort för meny och användare
- Bekräftelsedialoger (confirm/prompt)

---

## Säkerhets- och valideringslogik

- Endast inloggade användare kan nå dashboard
- Rollkontroll innan CRUD-operationer
- Lösenordsbekräftelse vid användarskapande
- Enkel klientvalidering av formulär
- Bekräftelse innan destruktiva operationer (delete)

---

## Tekniker

- HTML5
- CSS3 (Grid, Flexbox, responsive design)
- JavaScript (ES6+)
- Fetch API
- JWT (JSON Web Tokens)
- LocalStorage
- REST API-kommunikation

---

## Projektstruktur

- `login.html` – inloggning
- `dashboard.html` – adminpanel
- `auth.js` – tokenhantering
- `login.js` – loginlogik
- `dashboard.js` – all adminlogik
- `style.css` – gemensam styling

---

## Koppling till backend

Adminapplikationen är beroende av backend-servern:


http://localhost:5000


Backend ansvarar för:

- autentisering (JWT)
- användarhantering
- menydata
- rollhantering
- datalagring

Frontend ansvarar för:

- visning
- interaktion
- användarflöde
- API-anrop

---

## Viktig notering

För att adminpanelen ska fungera korrekt måste backend vara igång på:


http://localhost:5000


För att logga in på sidan som admin är:
Användarnamn: admin1
Lösenord: admin123

För att logga in på sidan som chef är:
Användarnamn: chef
Lösenord: chef123
