# Connect ROOT2 Google Sheet (required once)

Your sheet:  
https://docs.google.com/spreadsheets/d/1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk/edit

## Steps

1. Open the Google Sheet above.
2. **Extensions → Apps Script**.
3. Delete any default code.
4. Create/replace files:
   - `Code.gs` ← paste from this folder’s `Code.gs`
   - `Setup.gs` ← paste from this folder’s `Setup.gs`
5. Save the project.
6. Select function **`bootstrapRoot2`** → click **Run**.
7. Approve Google permissions when prompted.
8. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Copy the `/exec` URL into:
   - `src/environments/environment.ts` → `apiUrl`
   - `src/environments/environment.prod.ts` → `apiUrl`
10. Redeploy the website (Vercel).

`bootstrapRoot2` will:
- Set admin login (`admin` / `root2admin`)
- Attach spreadsheet ID `1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk`
- Create tabs: Hero, About, Programs, Workshops, CareerPaths, Blogs, Gallery, Testimonials, FAQs, Downloads, Footer, Contacts, Newsletter, WorkshopRegistrations, Settings, SEO, SocialLinks, Statistics, Partners, Team
- Seed starter content (including partners)
