# FIX: Google Sheet not updating (required once)

Your live Apps Script is still using placeholder IDs:

`REPLACE_WITH_CMS_SPREADSHEET_ID`

That is why nothing writes to  
https://docs.google.com/spreadsheets/d/1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk/edit

## Do this now (5 minutes)

### 1) Open Apps Script from your sheet
1. Open the sheet link above  
2. **Extensions → Apps Script**

### 2) Replace ALL code with one file
1. Delete every existing `.gs` file in the Apps Script project  
2. Create one file named `Code.gs`  
3. Copy **everything** from `Root2Api.gs` in this folder and paste it  
4. Click **Save**

### 3) Run bootstrap
1. Function dropdown → choose **`bootstrapRoot2`**  
2. Click **Run**  
3. Click **Review permissions → Allow**  
4. When finished, your sheet will get tabs like `Hero`, `Programs`, `Partners`, `Settings`, etc. with sample rows

### 4) Redeploy the Web App (important)
1. **Deploy → Manage deployments**  
2. Click the pencil (Edit) on the existing deployment **or** **New deployment**  
3. Type: **Web app**  
4. Execute as: **Me**  
5. Who has access: **Anyone**  
6. **Deploy**  
7. Copy the URL ending in `/exec`

### 5) Verify
Open this in your browser (use your `/exec` URL):

```
YOUR_EXEC_URL?action=health
```

You should see `"success":true` and tabs including `Hero` / `Partners`.

Then seed/bootstrap if needed:

```
YOUR_EXEC_URL?action=bootstrap
```

### 6) Update website API URL (if /exec changed)
Put the new `/exec` URL in:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Then push + redeploy Vercel.

## Admin login
- Username: `admin`
- Password: `root2admin`
