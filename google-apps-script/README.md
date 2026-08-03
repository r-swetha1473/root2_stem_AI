# ROOT2 STEM AI — Google Apps Script Backend

Production REST-style API for the Angular CMS. Data lives in **three Google Spreadsheets** (CMS, Forms, Settings) and is exposed via a deployed Web App URL.

## Architecture

| Spreadsheet | Script property | Sheet tabs |
|-------------|-----------------|------------|
| CMS | `CMS_SPREADSHEET_ID` | Hero, About, Programs, Workshops, CareerPaths, Blogs, Gallery, Testimonials, FAQs, Downloads, Footer |
| Forms | `FORMS_SPREADSHEET_ID` | Contacts, Newsletter, WorkshopRegistrations |
| Settings | `SETTINGS_SPREADSHEET_ID` | Settings, SEO, SocialLinks, Statistics, Partners, Team |

Common columns on every tab: `id`, `title`, `subtitle`, `description`, `image`, `status`, `created_at`, `updated_at`, `display_order` (+ sheet-specific columns added dynamically from JSON keys).

## Step-by-step setup

### 1. Create three Google Spreadsheets

1. Go to [Google Sheets](https://sheets.google.com) and create three new spreadsheets, e.g.:
   - `ROOT2 CMS`
   - `ROOT2 Forms`
   - `ROOT2 Settings`
2. Copy each spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 2. Create the Apps Script project

1. Open any of the spreadsheets → **Extensions → Apps Script**.
2. Delete default `Code.gs` content.
3. Add project files from this folder:
   - `Code.gs` — API handlers (`doGet` / `doPost`)
   - `Setup.gs` — initialization & seed helpers
4. Save the project (name it e.g. `ROOT2 STEM AI API`).

### 3. Set Script Properties

**Project Settings → Script properties** (or run `setDefaultCredentials()` once from the editor):

| Property | Description |
|----------|-------------|
| `CMS_SPREADSHEET_ID` | CMS spreadsheet ID |
| `FORMS_SPREADSHEET_ID` | Forms spreadsheet ID |
| `SETTINGS_SPREADSHEET_ID` | Settings spreadsheet ID |
| `ADMIN_USERNAME` | Admin login username (default: `admin`) |
| `ADMIN_PASSWORD` | Admin login password (default: `root2admin`) |
| `ADMIN_EMAIL` | Receives contact form notifications |

Run from the editor:

```javascript
setDefaultCredentials(); // then replace placeholder IDs in Script Properties
initializeSpreadsheets(); // creates tabs + headers
seedSampleData();         // optional starter rows
```

Or call the API after deploy:

```json
POST { "action": "seed", "includeSamples": "true" }
```

### 4. Deploy as Web App

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy and copy the **Web app URL** (ends with `/exec`).

### 5. Connect the Angular app

In `src/environments/environment.prod.ts` (and `environment.ts` for local testing):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  siteUrl: 'https://root2stemai.com',
  useMockData: false,
  // ...
};
```

Rebuild/redeploy the site. With `useMockData: false` and a valid `apiUrl`, the app uses Google Sheets instead of localStorage mock data.

## Default admin credentials

After `setDefaultCredentials()`:

- **Username:** `admin`
- **Password:** `root2admin`

Change these in Script Properties before production deploy.

## API reference

All responses: `{ success, data?, message?, total?, page?, pageSize?, error? }`

### GET (query parameters)

| action | params |
|--------|--------|
| `list` | `sheet`, `spreadsheet` (cms\|forms\|settings), `page`, `pageSize`, `search`, `status`, `category`, `sortBy`, `sortDir` |
| `get` | `sheet`, `spreadsheet`, `id` |

Example:

```
GET .../exec?action=list&sheet=Programs&spreadsheet=cms&page=1&pageSize=20
```

### POST (JSON body)

| action | body |
|--------|------|
| `login` | `{ username, password }` |
| `create` | `{ sheet, spreadsheet, data }` |
| `update` | `{ sheet, spreadsheet, id, data }` |
| `delete` | `{ sheet, spreadsheet, id }` |
| `seed` | `{ includeSamples?: "true" \| "false" }` |

Example:

```json
{
  "action": "create",
  "sheet": "Contacts",
  "spreadsheet": "forms",
  "data": {
    "title": "Jane Doe",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Programs",
    "message": "Hello",
    "status": "active"
  }
}
```

### Features

- **Validation** — required fields, status enum, email format for Contacts/Newsletter
- **Pagination & search** — list action supports filters matching the Angular `SheetsApiService`
- **Dynamic columns** — new keys in `data` extend the sheet header row automatically
- **Contact email** — `MailApp.sendEmail` to `ADMIN_EMAIL` when a Contact row is created
- **Newsletter dedup** — rejects duplicate email addresses

## CORS & browser limitations

Google Apps Script Web Apps **redirect** requests. Implications:

- **GET** from browsers (Angular `HttpClient.get`) generally works for `list` and `get`.
- **POST** JSON may encounter cross-origin redirect/CORS edge cases depending on deployment and browser. This API does **not** use JSONP.
- **OPTIONS** preflight is **not** supported (Apps Script has no `doOptions`).

**Recommendations:**

1. Use GET for read operations (already how `SheetsApiService` works).
2. For production POST reliability from `root2stemai.com`, add a thin **HTTPS proxy** (Cloudflare Worker, Firebase Function) that forwards JSON to the `/exec` URL and returns JSON with proper `Access-Control-Allow-Origin`.
3. Alternatively, deploy the Angular app and API under origins that your deployment testing confirms work with your target browsers.

## Files in this folder

| File | Purpose |
|------|---------|
| `Code.gs` | REST API — `doGet`, `doPost`, CRUD, login, validation |
| `Setup.gs` | `initializeSpreadsheets()`, `setDefaultCredentials()`, `seedSampleData()` |
| `README.md` | This guide |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Script property CMS_SPREADSHEET_ID is not set` | Add IDs in Script Properties |
| `Sheet tab "Programs" not found` | Run `initializeSpreadsheets()` |
| Contact emails not sent | Set `ADMIN_EMAIL`; authorize MailApp on first run |
| 401 / login fails | Verify `ADMIN_USERNAME` / `ADMIN_PASSWORD` |
| Angular still uses mock data | Set `useMockData: false` and a real `apiUrl` (not `YOUR_APPS_SCRIPT...`) |
