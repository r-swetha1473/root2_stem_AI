/**
 * ROOT2 STEM AI — Google Apps Script REST API
 *
 * Deploy as Web App (Execute as: Me, Access: Anyone) and set the /exec URL
 * in Angular environment.apiUrl with useMockData: false.
 *
 * CORS note: Apps Script Web Apps redirect cross-origin requests. Browser
 * GET calls work when the client follows redirects. POST from browsers may
 * hit opaque redirect / CORS limits depending on origin. This API is designed
 * for POST JSON bodies (no JSONP). For strict CORS in production, place a
 * thin proxy (Cloudflare Worker, Firebase Function) in front of the Web App URL.
 */

var SPREADSHEET_PROP_KEYS = {
  cms: 'CMS_SPREADSHEET_ID',
  forms: 'FORMS_SPREADSHEET_ID',
  settings: 'SETTINGS_SPREADSHEET_ID',
};

var SHEET_SPREADSHEET = {
  Hero: 'cms',
  About: 'cms',
  Programs: 'cms',
  Workshops: 'cms',
  CareerPaths: 'cms',
  Blogs: 'cms',
  Gallery: 'cms',
  Testimonials: 'cms',
  FAQs: 'cms',
  Downloads: 'cms',
  Footer: 'cms',
  Contacts: 'forms',
  Newsletter: 'forms',
  WorkshopRegistrations: 'forms',
  Settings: 'settings',
  SEO: 'settings',
  SocialLinks: 'settings',
  Statistics: 'settings',
  Partners: 'settings',
  Team: 'settings',
};

var COMMON_HEADERS = [
  'id',
  'title',
  'subtitle',
  'description',
  'image',
  'status',
  'created_at',
  'updated_at',
  'display_order',
];

var SHEET_EXTRA_HEADERS = {
  Hero: ['badge', 'cta_primary', 'cta_primary_link', 'cta_secondary', 'cta_secondary_link'],
  About: ['section'],
  Programs: ['duration', 'certificate', 'audience', 'benefits', 'enroll_link', 'level', 'slug'],
  Workshops: [
    'date',
    'end_date',
    'venue',
    'trainer',
    'agenda',
    'sessions',
    'register_link',
    'type',
    'capacity',
    'faqs',
  ],
  CareerPaths: ['slug', 'skills', 'salary', 'roadmap', 'career_growth', 'tools', 'overview'],
  Blogs: [
    'slug',
    'category',
    'author',
    'content',
    'meta_title',
    'meta_description',
    'tags',
    'read_time',
    'featured',
    'views',
  ],
  Gallery: ['category', 'media_type', 'video_url'],
  Testimonials: ['role', 'company', 'rating'],
  FAQs: ['category', 'answer'],
  Downloads: ['file_url', 'file_type', 'category'],
  Footer: ['quick_links', 'programs_links', 'newsletter_text'],
  Contacts: ['name', 'email', 'phone', 'subject', 'message', 'read'],
  Newsletter: ['email'],
  WorkshopRegistrations: ['name', 'email', 'phone', 'workshop_id', 'workshop_title'],
  Settings: [
    'site_name',
    'tagline',
    'email',
    'phone',
    'address',
    'map_embed',
    'logo',
    'favicon',
    'about_short',
    'copyright',
  ],
  SEO: [
    'default_title',
    'default_description',
    'og_image',
    'twitter_handle',
    'keywords',
    'canonical_base',
  ],
  SocialLinks: ['platform', 'url', 'icon'],
  Statistics: ['value', 'suffix', 'icon'],
  Partners: ['website', 'logo'],
  Team: ['role', 'bio', 'linkedin', 'email'],
};

var VALID_STATUSES = ['active', 'inactive', 'draft'];

function doGet(e) {
  return jsonResponse(handleRequest_(e, 'GET'));
}

function doPost(e) {
  return jsonResponse(handleRequest_(e, 'POST'));
}

/**
 * Apps Script has no native doOptions; OPTIONS preflight is not supported.
 * Documented in README — use GET for reads; POST JSON for mutations.
 */
function jsonResponse(result) {
  var output = ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
  return output;
}

function handleRequest_(e, method) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var body = {};

    if (method === 'POST') {
      body = parseJsonBody_(e);
      params = mergeObjects_(params, body);
    }

    var action = String(params.action || '').toLowerCase();
    if (!action) {
      return fail_('Missing action parameter');
    }

    switch (action) {
      case 'login':
        return actionLogin_(params);
      case 'list':
        return actionList_(params);
      case 'get':
        return actionGet_(params);
      case 'create':
        return actionCreate_(params);
      case 'update':
        return actionUpdate_(params);
      case 'delete':
        return actionDelete_(params);
      case 'seed':
        return actionSeed_(params);
      default:
        return fail_('Unknown action: ' + action);
    }
  } catch (err) {
    return fail_(err.message || String(err));
  }
}

function actionLogin_(params) {
  var username = String(params.username || '').trim();
  var password = String(params.password || '');
  var props = PropertiesService.getScriptProperties();
  var adminUser = props.getProperty('ADMIN_USERNAME') || 'admin';
  var adminPass = props.getProperty('ADMIN_PASSWORD') || 'root2admin';

  if (username !== adminUser || password !== adminPass) {
    return fail_('Invalid username or password');
  }

  var token = Utilities.base64EncodeWebSafe(
    username + ':' + new Date().getTime() + ':' + Utilities.getUuid()
  );

  return {
    success: true,
    data: { token: token, username: username },
    message: 'Logged in',
  };
}

function actionList_(params) {
  var sheetName = validateSheetName_(params.sheet);
  if (!sheetName.ok) return fail_(sheetName.error);

  var sheet = getSheet_(sheetName.value, params.spreadsheet);
  if (!sheet.ok) return fail_(sheet.error);

  var rows = sheetToObjects_(sheet.value);
  rows = applyFilters_(rows, params);
  rows = applySort_(rows, params);

  var page = Math.max(1, parseInt(params.page, 10) || 1);
  var pageSize = Math.min(10000, Math.max(1, parseInt(params.pageSize, 10) || 100));
  var start = (page - 1) * pageSize;
  var pageRows = rows.slice(start, start + pageSize);

  return {
    success: true,
    data: pageRows,
    total: rows.length,
    page: page,
    pageSize: pageSize,
  };
}

function actionGet_(params) {
  var sheetName = validateSheetName_(params.sheet);
  if (!sheetName.ok) return fail_(sheetName.error);

  var id = String(params.id || '').trim();
  if (!id) return fail_('Missing id');

  var sheet = getSheet_(sheetName.value, params.spreadsheet);
  if (!sheet.ok) return fail_(sheet.error);

  var rows = sheetToObjects_(sheet.value);
  var found = rows.filter(function (r) {
    return String(r.id) === id;
  })[0];

  if (!found) return fail_('Record not found');
  return { success: true, data: found };
}

function actionCreate_(params) {
  var sheetName = validateSheetName_(params.sheet);
  if (!sheetName.ok) return fail_(sheetName.error);

  var data = params.data;
  if (!data || typeof data !== 'object') return fail_('Missing data object');

  var sheetResult = getSheet_(sheetName.value, params.spreadsheet);
  if (!sheetResult.ok) return fail_(sheetResult.error);

  var sheet = sheetResult.value;
  var now = new Date().toISOString();
  var rows = sheetToObjects_(sheet);
  var record = normalizeRecord_(data, sheetName.value, rows.length + 1, now, true);

  var validation = validateRecord_(record, sheetName.value);
  if (!validation.ok) return fail_(validation.error);

  if (sheetName.value === 'Newsletter') {
    var dup = findDuplicateEmail_(rows, record.email);
    if (dup) return fail_('Email already subscribed');
  }

  ensureHeaders_(sheet, sheetName.value, record);
  appendRecord_(sheet, record);

  if (sheetName.value === 'Contacts') {
    notifyAdminContact_(record);
  }

  return { success: true, data: record, message: 'Created' };
}

function actionUpdate_(params) {
  var sheetName = validateSheetName_(params.sheet);
  if (!sheetName.ok) return fail_(sheetName.error);

  var id = String(params.id || '').trim();
  if (!id) return fail_('Missing id');

  var data = params.data;
  if (!data || typeof data !== 'object') return fail_('Missing data object');

  var sheetResult = getSheet_(sheetName.value, params.spreadsheet);
  if (!sheetResult.ok) return fail_(sheetResult.error);

  var sheet = sheetResult.value;
  var rows = sheetToObjects_(sheet);
  var index = -1;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === id) {
      index = i;
      break;
    }
  }
  if (index < 0) return fail_('Record not found');

  var now = new Date().toISOString();
  var updated = mergeObjects_(rows[index], data);
  updated.id = id;
  updated.updated_at = now;
  if (!updated.created_at) updated.created_at = now;

  var validation = validateRecord_(updated, sheetName.value);
  if (!validation.ok) return fail_(validation.error);

  ensureHeaders_(sheet, sheetName.value, updated);
  writeRecordAtRow_(sheet, index + 2, updated);
  return { success: true, data: updated, message: 'Updated' };
}

function actionDelete_(params) {
  var sheetName = validateSheetName_(params.sheet);
  if (!sheetName.ok) return fail_(sheetName.error);

  var id = String(params.id || '').trim();
  if (!id) return fail_('Missing id');

  var sheetResult = getSheet_(sheetName.value, params.spreadsheet);
  if (!sheetResult.ok) return fail_(sheetResult.error);

  var sheet = sheetResult.value;
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return fail_('Record not found');

  var headers = values[0];
  var idCol = headers.indexOf('id');
  if (idCol < 0) return fail_('Sheet missing id column');

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === id) {
      sheet.deleteRow(r + 1);
      return { success: true, data: null, message: 'Deleted' };
    }
  }
  return fail_('Record not found');
}

function actionSeed_(params) {
  if (typeof initializeSpreadsheets !== 'function') {
    return fail_('Setup.gs not loaded — add Setup.gs to the project');
  }
  var result = initializeSpreadsheets();
  if (typeof seedSampleData === 'function' && params.includeSamples !== 'false') {
    seedSampleData();
  }
  return {
    success: true,
    message: 'Spreadsheets initialized' + (params.includeSamples !== 'false' ? ' with sample rows' : ''),
    data: result,
  };
}

function validateSheetName_(sheet) {
  var name = String(sheet || '').trim();
  if (!name) return { ok: false, error: 'Missing sheet name' };
  if (!SHEET_SPREADSHEET[name]) return { ok: false, error: 'Invalid sheet: ' + name };
  return { ok: true, value: name };
}

function getSpreadsheetId_(kind, explicitKind) {
  var resolved = explicitKind || kind;
  if (!resolved) return { ok: false, error: 'Missing spreadsheet kind' };

  var normalized = String(resolved).toLowerCase();
  var propKey = SPREADSHEET_PROP_KEYS[normalized];
  if (!propKey) return { ok: false, error: 'Invalid spreadsheet: ' + resolved };

  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(propKey);

  // Fallback: single ROOT2 workbook for all three logical spreadsheets
  if (!id || String(id).indexOf('REPLACE_') === 0) {
    id =
      props.getProperty('CMS_SPREADSHEET_ID') ||
      props.getProperty('ROOT2_SPREADSHEET_ID') ||
      '1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk';
  }

  if (!id || String(id).indexOf('REPLACE_') === 0) {
    return {
      ok: false,
      error: 'Spreadsheet ID not set. In Apps Script editor run bootstrapRoot2() from Setup.gs.',
    };
  }
  return { ok: true, value: id };
}

function getSheet_(sheetName, spreadsheetKind) {
  var kind = spreadsheetKind || SHEET_SPREADSHEET[sheetName];
  var ssResult = getSpreadsheetId_(kind, spreadsheetKind);
  if (!ssResult.ok) return ssResult;

  try {
    var ss = SpreadsheetApp.openById(ssResult.value);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return { ok: false, error: 'Sheet tab "' + sheetName + '" not found. Run initializeSpreadsheets().' };
    }
    return { ok: true, value: sheet };
  } catch (err) {
    return { ok: false, error: 'Cannot open spreadsheet: ' + err.message };
  }
}

function getHeadersForSheet_(sheetName) {
  var extras = SHEET_EXTRA_HEADERS[sheetName] || [];
  var seen = {};
  var headers = [];
  COMMON_HEADERS.concat(extras).forEach(function (h) {
    if (!seen[h]) {
      seen[h] = true;
      headers.push(h);
    }
  });
  return headers;
}

function ensureHeaders_(sheet, sheetName, record) {
  var values = sheet.getDataRange().getValues();
  var headers = values.length ? values[0].slice() : [];

  if (!headers.length) {
    headers = getHeadersForSheet_(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  Object.keys(record).forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
    }
  });

  if (values.length) {
    var current = values[0];
    if (headers.length > current.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
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
      obj[key] = coerceValue_(val);
    }
    if (!empty && obj.id) rows.push(obj);
  }
  return rows;
}

function coerceValue_(val) {
  if (val === '' || val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'number') return val;
  var s = String(val);
  if (s === 'TRUE' || s === 'true') return true;
  if (s === 'FALSE' || s === 'false') return false;
  if (/^-?\d+$/.test(s)) return Number(s);
  if (/^-?\d+\.\d+$/.test(s)) return Number(s);
  return s;
}

function normalizeRecord_(data, sheetName, displayOrder, now, isCreate) {
  var record = mergeObjects_({}, data);
  if (isCreate || !record.id) {
    record.id =
      record.id ||
      sheetName.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
        '-' +
        Utilities.getUuid().substring(0, 8);
  }
  record.title = record.title || 'Untitled';
  record.status = record.status || 'active';
  record.display_order = Number(record.display_order) || displayOrder;
  record.created_at = record.created_at || now;
  record.updated_at = now;
  return record;
}

function validateRecord_(record, sheetName) {
  if (!record.id) return { ok: false, error: 'id is required' };
  if (record.status && VALID_STATUSES.indexOf(String(record.status)) === -1) {
    return { ok: false, error: 'Invalid status. Use active, inactive, or draft.' };
  }

  if (sheetName === 'Newsletter' || sheetName === 'Contacts') {
    var email = String(record.email || record.title || '').trim();
    if (!email || email.indexOf('@') < 1) {
      return { ok: false, error: 'Valid email is required' };
    }
    record.email = email;
  }

  return { ok: true };
}

function applyFilters_(rows, params) {
  var result = rows.slice();

  if (params.status) {
    result = result.filter(function (r) {
      return String(r.status) === params.status;
    });
  }

  if (params.category) {
    result = result.filter(function (r) {
      return String(r.category || '') === params.category;
    });
  }

  if (params.search) {
    var q = String(params.search).toLowerCase();
    result = result.filter(function (r) {
      return JSON.stringify(r).toLowerCase().indexOf(q) !== -1;
    });
  }

  return result;
}

function applySort_(rows, params) {
  var sortBy = params.sortBy || 'display_order';
  var sortDir = String(params.sortDir || 'asc').toLowerCase() === 'desc' ? -1 : 1;

  return rows.sort(function (a, b) {
    var av = a[sortBy];
    var bv = b[sortBy];
    if (av === bv) return 0;
    if (av === undefined || av === null || av === '') return 1;
    if (bv === undefined || bv === null || bv === '') return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
    return String(av).localeCompare(String(bv)) * sortDir;
  });
}

function appendRecord_(sheet, record) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var row = headers.map(function (h) {
    return serializeValue_(record[h]);
  });
  sheet.appendRow(row);
}

function writeRecordAtRow_(sheet, rowNumber, record) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) {
    return serializeValue_(record[h]);
  });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
}

function serializeValue_(val) {
  if (val === undefined || val === null) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return val;
}

function findDuplicateEmail_(rows, email) {
  var target = String(email || '').trim().toLowerCase();
  if (!target) return false;
  return rows.some(function (r) {
    var e = String(r.email || r.title || '').trim().toLowerCase();
    return e === target;
  });
}

function notifyAdminContact_(record) {
  var props = PropertiesService.getScriptProperties();
  var adminEmail = props.getProperty('ADMIN_EMAIL');
  if (!adminEmail) return;

  var subject = '[ROOT2 STEM AI] New contact: ' + (record.subject || record.title || 'Message');
  var body =
    'A new contact form submission was received.\n\n' +
    'Name: ' +
    (record.name || record.title || '') +
    '\nEmail: ' +
    (record.email || '') +
    '\nPhone: ' +
    (record.phone || '') +
    '\nSubject: ' +
    (record.subject || '') +
    '\n\nMessage:\n' +
    (record.message || '') +
    '\n\n— ROOT2 STEM AI CMS';

  try {
    MailApp.sendEmail(adminEmail, subject, body);
  } catch (err) {
    console.warn('Contact email failed: ' + err.message);
  }
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    throw new Error('Invalid JSON body');
  }
}

function mergeObjects_(target, source) {
  var out = {};
  var k;
  for (k in target) {
    if (Object.prototype.hasOwnProperty.call(target, k)) out[k] = target[k];
  }
  for (k in source) {
    if (Object.prototype.hasOwnProperty.call(source, k)) out[k] = source[k];
  }
  return out;
}

function fail_(message) {
  return { success: false, error: message };
}
