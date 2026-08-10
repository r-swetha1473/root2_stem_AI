/**
 * ROOT2 STEM AI — SINGLE FILE Apps Script API
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk/edit
 *
 * INSTALL (do this once):
 * 1) Open the Google Sheet above
 * 2) Extensions → Apps Script
 * 3) Delete ALL existing .gs files
 * 4) Paste THIS entire file as Code.gs
 * 5) Save → select function bootstrapRoot2 → Run → Allow permissions
 * 6) Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7) Copy the /exec URL into Angular environment.apiUrl and redeploy Vercel
 *
 * Optional: after deploy, open:
 *   YOUR_EXEC_URL?action=bootstrap
 */

var ROOT2_SPREADSHEET_ID = '1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk';

var ALL_SHEETS = [
  'Hero', 'About', 'Programs', 'Workshops', 'CareerPaths', 'Blogs', 'Gallery',
  'Testimonials', 'FAQs', 'Downloads', 'Footer',
  'Contacts', 'Newsletter', 'WorkshopRegistrations',
  'Settings', 'SEO', 'SocialLinks', 'Statistics', 'Partners', 'Team',
];

var SHEET_KIND = {
  Hero: 'cms', About: 'cms', Programs: 'cms', Workshops: 'cms', CareerPaths: 'cms',
  Blogs: 'cms', Gallery: 'cms', Testimonials: 'cms', FAQs: 'cms', Downloads: 'cms', Footer: 'cms',
  Contacts: 'forms', Newsletter: 'forms', WorkshopRegistrations: 'forms',
  Settings: 'settings', SEO: 'settings', SocialLinks: 'settings', Statistics: 'settings',
  Partners: 'settings', Team: 'settings',
};

var COMMON_HEADERS = [
  'id', 'title', 'subtitle', 'description', 'image', 'status', 'created_at', 'updated_at', 'display_order',
];

var EXTRA_HEADERS = {
  Hero: ['badge', 'cta_primary', 'cta_primary_link', 'cta_secondary', 'cta_secondary_link'],
  About: ['section'],
  Programs: ['duration', 'certificate', 'audience', 'benefits', 'enroll_link', 'level', 'slug'],
  Workshops: ['date', 'end_date', 'venue', 'trainer', 'agenda', 'sessions', 'register_link', 'type', 'capacity', 'faqs'],
  CareerPaths: ['slug', 'skills', 'salary', 'roadmap', 'career_growth', 'tools', 'overview'],
  Blogs: ['slug', 'category', 'author', 'content', 'meta_title', 'meta_description', 'tags', 'read_time', 'featured', 'views'],
  Gallery: ['category', 'media_type', 'video_url'],
  Testimonials: ['role', 'company', 'rating'],
  FAQs: ['category', 'answer'],
  Downloads: ['file_url', 'file_type', 'category'],
  Footer: ['quick_links', 'programs_links', 'newsletter_text'],
  Contacts: ['name', 'email', 'phone', 'subject', 'message', 'read'],
  Newsletter: ['email'],
  WorkshopRegistrations: ['name', 'email', 'phone', 'workshop_id', 'workshop_title'],
  Settings: ['site_name', 'tagline', 'email', 'phone', 'address', 'map_embed', 'logo', 'favicon', 'about_short', 'copyright'],
  SEO: ['default_title', 'default_description', 'og_image', 'twitter_handle', 'keywords', 'canonical_base'],
  SocialLinks: ['platform', 'url', 'icon'],
  Statistics: ['value', 'suffix', 'icon'],
  Partners: ['website', 'logo'],
  Team: ['role', 'bio', 'linkedin', 'email'],
};

function doGet(e) {
  return json_(handle_(e, 'GET'));
}

function doPost(e) {
  return json_(handle_(e, 'POST'));
}

function json_(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(e, method) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    if (method === 'POST') {
      params = merge_(params, parseBody_(e));
    }
    var action = String(params.action || '').toLowerCase();
    if (!action) return fail_('Missing action');

    switch (action) {
      case 'bootstrap':
      case 'seed':
        return bootstrapRoot2();
      case 'health':
        return health_();
      case 'login':
        return login_(params);
      case 'list':
        return list_(params);
      case 'get':
        return get_(params);
      case 'create':
        return create_(params);
      case 'update':
        return update_(params);
      case 'delete':
        return remove_(params);
      default:
        return fail_('Unknown action: ' + action);
    }
  } catch (err) {
    return fail_(err.message || String(err));
  }
}

/** Run from editor OR via ?action=bootstrap */
function bootstrapRoot2() {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'root2admin',
    ADMIN_EMAIL: 'hello@root2stemai.com',
    CMS_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
    FORMS_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
    SETTINGS_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
    ROOT2_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
  }, true);

  var ss = SpreadsheetApp.openById(ROOT2_SPREADSHEET_ID);
  var created = [];
  ALL_SHEETS.forEach(function (name) {
    ensureSheet_(ss, name);
    created.push(name);
  });

  var seeded = seedIfEmpty_();
  return {
    success: true,
    message: 'Bootstrap complete',
    data: {
      spreadsheetId: ROOT2_SPREADSHEET_ID,
      tabs: created,
      seeded: seeded,
    },
  };
}

function health_() {
  try {
    var ss = SpreadsheetApp.openById(ROOT2_SPREADSHEET_ID);
    var names = ss.getSheets().map(function (s) { return s.getName(); });
    return {
      success: true,
      data: {
        spreadsheetId: ROOT2_SPREADSHEET_ID,
        title: ss.getName(),
        tabs: names,
        hasHero: names.indexOf('Hero') >= 0,
        hasPartners: names.indexOf('Partners') >= 0,
      },
    };
  } catch (err) {
    return fail_('Health failed: ' + err.message);
  }
}

function login_(params) {
  var props = PropertiesService.getScriptProperties();
  var user = props.getProperty('ADMIN_USERNAME') || 'admin';
  var pass = props.getProperty('ADMIN_PASSWORD') || 'root2admin';
  if (String(params.username || '') !== user || String(params.password || '') !== pass) {
    return fail_('Invalid username or password');
  }
  return {
    success: true,
    data: {
      token: Utilities.base64EncodeWebSafe(user + ':' + Date.now() + ':' + Utilities.getUuid()),
      username: user,
    },
  };
}

function list_(params) {
  var sheetName = requireSheetName_(params.sheet);
  var sheet = getOrCreateSheet_(sheetName);
  var rows = sheetToObjects_(sheet);
  rows = filterRows_(rows, params);
  rows.sort(function (a, b) {
    return Number(a.display_order || 0) - Number(b.display_order || 0);
  });
  var page = Math.max(1, parseInt(params.page, 10) || 1);
  var pageSize = Math.min(10000, Math.max(1, parseInt(params.pageSize, 10) || 100));
  var start = (page - 1) * pageSize;
  return {
    success: true,
    data: rows.slice(start, start + pageSize),
    total: rows.length,
    page: page,
    pageSize: pageSize,
  };
}

function get_(params) {
  var sheetName = requireSheetName_(params.sheet);
  var id = String(params.id || '');
  if (!id) return fail_('Missing id');
  var rows = sheetToObjects_(getOrCreateSheet_(sheetName));
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === id) return { success: true, data: rows[i] };
  }
  return fail_('Record not found');
}

function create_(params) {
  var sheetName = requireSheetName_(params.sheet);
  var sheet = getOrCreateSheet_(sheetName);
  var data = params.data || params;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { return fail_('Invalid data JSON'); }
  }
  var now = new Date().toISOString();
  var record = normalize_(data, sheetName, sheet.getLastRow(), now, true);

  if (sheetName === 'Newsletter' || sheetName === 'Contacts') {
    var email = String(record.email || record.title || '').trim();
    if (!email || email.indexOf('@') < 1) return fail_('Valid email is required');
    record.email = email;
    if (sheetName === 'Newsletter') {
      var existing = sheetToObjects_(sheet);
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i].email || '').toLowerCase() === email.toLowerCase()) {
          return fail_('Email already subscribed');
        }
      }
    }
  }

  ensureHeaders_(sheet, sheetName, record);
  append_(sheet, record);

  if (sheetName === 'Contacts') {
    try {
      var adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
      if (adminEmail) {
        MailApp.sendEmail(
          adminEmail,
          'ROOT2 Contact: ' + (record.subject || record.title || 'New message'),
          'From: ' + (record.name || '') + ' <' + (record.email || '') + '>\nPhone: ' +
            (record.phone || '') + '\n\n' + (record.message || record.description || '')
        );
      }
    } catch (mailErr) {
      // ignore mail failures
    }
  }

  return { success: true, data: record, message: 'Created' };
}

function update_(params) {
  var sheetName = requireSheetName_(params.sheet);
  var id = String(params.id || '');
  if (!id) return fail_('Missing id');
  var sheet = getOrCreateSheet_(sheetName);
  var data = params.data || params;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (e) { return fail_('Invalid data JSON'); }
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return fail_('Record not found');
  var headers = values[0];
  var idCol = headers.indexOf('id');
  if (idCol < 0) return fail_('Missing id column');

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === id) {
      var current = {};
      for (var c = 0; c < headers.length; c++) current[headers[c]] = values[r][c];
      var merged = merge_(current, data);
      merged.id = id;
      merged.updated_at = new Date().toISOString();
      ensureHeaders_(sheet, sheetName, merged);
      writeRow_(sheet, r + 1, merged);
      return { success: true, data: rowToObject_(sheet, r + 1), message: 'Updated' };
    }
  }
  return fail_('Record not found');
}

function remove_(params) {
  var sheetName = requireSheetName_(params.sheet);
  var id = String(params.id || '');
  if (!id) return fail_('Missing id');
  var sheet = getOrCreateSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return fail_('Record not found');
  var headers = values[0];
  var idCol = headers.indexOf('id');
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === id) {
      sheet.deleteRow(r + 1);
      return { success: true, data: null, message: 'Deleted' };
    }
  }
  return fail_('Record not found');
}

/** ALWAYS use the real ROOT2 spreadsheet — never REPLACE_ placeholders */
function spreadsheetId_() {
  var props = PropertiesService.getScriptProperties();
  var candidates = [
    ROOT2_SPREADSHEET_ID,
    props.getProperty('ROOT2_SPREADSHEET_ID'),
    props.getProperty('CMS_SPREADSHEET_ID'),
    props.getProperty('FORMS_SPREADSHEET_ID'),
    props.getProperty('SETTINGS_SPREADSHEET_ID'),
  ];
  for (var i = 0; i < candidates.length; i++) {
    var id = String(candidates[i] || '').trim();
    if (id && id.indexOf('REPLACE_') !== 0 && id.length > 20) return id;
  }
  return ROOT2_SPREADSHEET_ID;
}

function getOrCreateSheet_(sheetName) {
  var ss = SpreadsheetApp.openById(spreadsheetId_());
  return ensureSheet_(ss, sheetName);
}

function ensureSheet_(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  var headers = headersFor_(sheetName);
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (!existing.length || existing[0] !== 'id') {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e8f0fe');
  }
  return sheet;
}

function headersFor_(sheetName) {
  var extras = EXTRA_HEADERS[sheetName] || [];
  var seen = {};
  var out = [];
  COMMON_HEADERS.concat(extras).forEach(function (h) {
    if (!seen[h]) {
      seen[h] = true;
      out.push(h);
    }
  });
  return out;
}

function ensureHeaders_(sheet, sheetName, record) {
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  if (!headers.length || headers[0] !== 'id') {
    headers = headersFor_(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  Object.keys(record || {}).forEach(function (key) {
    if (headers.indexOf(key) === -1) headers.push(key);
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function sheetToObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    var empty = true;
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      if (!key) continue;
      var val = values[r][c];
      if (val !== '' && val !== null && val !== undefined) empty = false;
      obj[key] = coerce_(val);
    }
    if (!empty && obj.id) rows.push(obj);
  }
  return rows;
}

function rowToObject_(sheet, rowNumber) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  var obj = {};
  for (var i = 0; i < headers.length; i++) obj[headers[i]] = coerce_(values[i]);
  return obj;
}

function append_(sheet, record) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(function (h) { return serialize_(record[h]); }));
}

function writeRow_(sheet, rowNumber, record) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) { return serialize_(record[h]); });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function normalize_(data, sheetName, displayOrder, now, isCreate) {
  var record = merge_({}, data || {});
  if (isCreate || !record.id) {
    record.id = record.id || (sheetName.toLowerCase() + '-' + Utilities.getUuid().substring(0, 8));
  }
  record.title = record.title || 'Untitled';
  record.status = record.status || 'active';
  record.display_order = Number(record.display_order) || displayOrder || 1;
  record.created_at = record.created_at || now;
  record.updated_at = now;
  return record;
}

function filterRows_(rows, params) {
  var result = rows.slice();
  if (params.status) {
    result = result.filter(function (r) { return String(r.status) === String(params.status); });
  }
  if (params.category) {
    result = result.filter(function (r) { return String(r.category || '') === String(params.category); });
  }
  if (params.search) {
    var q = String(params.search).toLowerCase();
    result = result.filter(function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) !== -1; });
  }
  return result;
}

function requireSheetName_(name) {
  var sheetName = String(name || '');
  if (ALL_SHEETS.indexOf(sheetName) === -1) {
    throw new Error('Invalid sheet: ' + sheetName);
  }
  return sheetName;
}

function coerce_(val) {
  if (val === '' || val === null || val === undefined) return '';
  if (typeof val === 'boolean' || typeof val === 'number') return val;
  if (Object.prototype.toString.call(val) === '[object Date]') return val.toISOString();
  var s = String(val);
  if (s === 'TRUE' || s === 'true') return true;
  if (s === 'FALSE' || s === 'false') return false;
  return s;
}

function serialize_(val) {
  if (val === undefined || val === null) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return val;
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents); } catch (err) { throw new Error('Invalid JSON body'); }
}

function merge_(a, b) {
  var out = {};
  var k;
  for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
  for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) out[k] = b[k];
  return out;
}

function fail_(message) {
  return { success: false, error: message };
}

function seedIfEmpty_() {
  var now = new Date().toISOString();
  var seeded = [];
  var samples = {
    Hero: [{
      id: 'hero-1', title: 'Build the Future AI Workforce from STEM Excellence',
      subtitle: 'AI Talent · Training · Workforce Solutions',
      description: 'ROOT2 STEM AI equips STEM minds with production-ready AI skills.',
      image: '/images/logo.png', badge: 'STEM × AI Career Platform',
      cta_primary: 'Explore Programs', cta_primary_link: '/programs',
      cta_secondary: 'Join Workshop', cta_secondary_link: '/workshops',
      status: 'active', created_at: now, updated_at: now, display_order: 1,
    }],
    Partners: [
      { id: 'p-1', title: 'Nova Labs', logo: '/illustrations/partner-1.svg', website: '#', status: 'active', created_at: now, updated_at: now, display_order: 1 },
      { id: 'p-2', title: 'Helix Edu', logo: '/illustrations/partner-2.svg', website: '#', status: 'active', created_at: now, updated_at: now, display_order: 2 },
      { id: 'p-3', title: 'Orbit Talent', logo: '/illustrations/partner-3.svg', website: '#', status: 'active', created_at: now, updated_at: now, display_order: 3 },
    ],
    Settings: [{
      id: 'settings-1', title: 'Settings', site_name: 'ROOT2 STEM AI',
      tagline: 'Building the Future AI Workforce from STEM Excellence',
      email: 'hello@root2stemai.com', phone: '+91 90000 00000', address: 'Bengaluru, India',
      logo: '/images/logo.png', copyright: '© 2026 ROOT2 STEM AI. All rights reserved.',
      status: 'active', created_at: now, updated_at: now, display_order: 1,
    }],
    SEO: [{
      id: 'seo-1', title: 'SEO', default_title: 'ROOT2 STEM AI',
      default_description: 'AI Talent, Training & Workforce Solutions from STEM Excellence',
      og_image: '/images/logo.png', keywords: 'STEM AI, ROOT2, Prompt Engineering',
      canonical_base: 'https://root2-stem-ai.vercel.app',
      status: 'active', created_at: now, updated_at: now, display_order: 1,
    }],
    Footer: [{
      id: 'footer-1',
      title: 'ROOT2 STEM AI',
      subtitle: 'Building the Future AI Workforce from STEM Excellence',
      description: 'AI Talent | Training | Workforce Solutions',
      quick_links: 'About|/about,Programs|/programs,Workshops|/workshops,Blog|/blog,Contact|/contact',
      programs_links: 'Prompt Engineering|/programs,AI Trainer|/career-paths/ai-trainer,Medical AI|/career-paths/medical-ai',
      newsletter_text: 'Get STEM–AI career insights and workshop invites.',
      status: 'active', created_at: now, updated_at: now, display_order: 1,
    }],
    Statistics: [
      { id: 'stat-1', title: 'Learners Trained', value: 1200, suffix: '+', status: 'active', created_at: now, updated_at: now, display_order: 1 },
      { id: 'stat-2', title: 'Career Pathways', value: 9, suffix: '', status: 'active', created_at: now, updated_at: now, display_order: 2 },
      { id: 'stat-3', title: 'Workshops Delivered', value: 48, suffix: '+', status: 'active', created_at: now, updated_at: now, display_order: 3 },
      { id: 'stat-4', title: 'Partner Organizations', value: 25, suffix: '+', status: 'active', created_at: now, updated_at: now, display_order: 4 },
    ],
  };

  Object.keys(samples).forEach(function (name) {
    var sheet = getOrCreateSheet_(name);
    if (sheet.getLastRow() > 1) return;
    samples[name].forEach(function (row) {
      ensureHeaders_(sheet, name, row);
      append_(sheet, row);
    });
    seeded.push(name);
  });
  return seeded;
}
