# ROOT2 STEM AI

Premium STEM × AI education and workforce platform.

**Tagline:** Building the Future AI Workforce from STEM Excellence

## Stack

- Angular 20 (standalone components, signals)
- Tailwind CSS 4
- Angular Material
- GSAP animations
- Google Sheets + Apps Script CMS (3 spreadsheets)
- Quill rich text (admin blog editor)

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200)

Admin: [http://localhost:4200/admin/login](http://localhost:4200/admin/login)

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `root2admin` |

> Mock CMS mode is enabled by default (`environment.useMockData = true`). Content CRUD persists in `localStorage` until you connect Apps Script.

## Project structure

```
src/app/
  core/           # models, guards, Sheets API, auth, SEO
  shared/         # reusable UI, pipes, directives
  layout/         # public + admin shells
  features/       # home, about, programs, workshops, careers, blog, gallery, faq, contact, admin
google-apps-script/  # Code.gs, Setup.gs, deploy guide
public/           # logo, SVG illustrations, robots.txt, sitemap.xml
```

## Public pages

| Route | Description |
|-------|-------------|
| `/` | Home (hero, stats, programs, careers, workshops, testimonials, gallery, blogs, FAQ) |
| `/about` | Mission, vision, founder, journey, values, team, partners |
| `/programs` | Program cards + detail |
| `/workshops` | Upcoming / past + registration |
| `/career-paths` | 9 AI career tracks + detail |
| `/blog` | Filter, search, detail, share |
| `/gallery` | Grid, categories, lightbox |
| `/faq` | Accordion + search |
| `/contact` | Form, map, social |
| `/admin` | Full CMS dashboard |

## Google Sheets CMS (3 workbooks)

| Spreadsheet | Tabs |
|-------------|------|
| **CMS** | Hero, About, Programs, Workshops, CareerPaths, Blogs, Gallery, Testimonials, FAQs, Downloads, Footer |
| **Forms** | Contacts, Newsletter, WorkshopRegistrations |
| **Settings** | Settings, SEO, SocialLinks, Statistics, Partners, Team |

See [google-apps-script/README.md](google-apps-script/README.md) for deploy steps.

### Connect live API

1. Deploy Apps Script web app (Anyone access).
2. Set in `src/environments/environment.ts` / `environment.prod.ts`:

```ts
apiUrl: 'https://script.google.com/macros/s/XXXX/exec',
useMockData: false,
```

## Build

```bash
npm run build
```

Output: `dist/root2-stem-ai`

## Cloudinary image uploads

Admin image fields upload to Cloudinary:

| Setting | Value |
|---------|-------|
| Cloud name | `vondzooh` |
| Folder | `Root2 STEM AI` |
| Upload preset | `root2_stem_ai` (unsigned) |

Create the preset in Cloudinary Console → **Settings → Upload → Upload presets**:
1. Add upload preset named `root2_stem_ai`
2. Signing mode: **Unsigned**
3. Optionally set Folder to `Root2 STEM AI` (or leave blank — the app sends the folder)

## Brand

- Navy `#002147` · Royal `#0056b3` · Sky `#00aeef` · Green `#68bb59`
- Full logo: `public/images/logo.png`
- Navbar: `public/images/logo-horizontal.svg`
- Icon/favicon: `public/images/logo-icon.svg`
