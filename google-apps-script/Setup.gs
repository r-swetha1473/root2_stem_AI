/**
 * ROOT2 STEM AI — Spreadsheet setup & seed helpers
 *
 * Run from the Apps Script editor:
 *   1. setDefaultCredentials()        — stores default admin + placeholder spreadsheet IDs
 *   2. initializeSpreadsheets()       — creates tabs + headers in all three spreadsheets
 *   3. seedSampleData()               — optional starter rows (mirrors Angular seed-data.ts)
 */

var CMS_SHEETS = [
  'Hero',
  'About',
  'Programs',
  'Workshops',
  'CareerPaths',
  'Blogs',
  'Gallery',
  'Testimonials',
  'FAQs',
  'Downloads',
  'Footer',
];

var FORMS_SHEETS = ['Contacts', 'Newsletter', 'WorkshopRegistrations'];

var SETTINGS_SHEETS = ['Settings', 'SEO', 'SocialLinks', 'Statistics', 'Partners', 'Team'];

/** Single workbook used for CMS + Forms + Settings tabs */
var ROOT2_SPREADSHEET_ID = '1GQ8_lwTyOf7gGHhvvSTNez-ID0t2jy7vmK_jH8sYmBk';

/**
 * Stores admin credentials and wires all three logical spreadsheets
 * to the ROOT2 STEM AI Google Sheet.
 */
function setDefaultCredentials() {
  var props = PropertiesService.getScriptProperties();
  props.setProperties({
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'root2admin',
    ADMIN_EMAIL: 'hello@root2stemai.com',
    CMS_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
    FORMS_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
    SETTINGS_SPREADSHEET_ID: ROOT2_SPREADSHEET_ID,
  });
  Logger.log('Credentials + spreadsheet ID set: ' + ROOT2_SPREADSHEET_ID);
}

/**
 * ONE-CLICK setup: credentials → create all tabs/headers → seed sample rows.
 * Run this from the Apps Script editor (select bootstrapRoot2 → Run).
 */
function bootstrapRoot2() {
  setDefaultCredentials();
  initializeSpreadsheets();
  seedSampleData();
  Logger.log('ROOT2 STEM AI Google Sheet is ready.');
  return { ok: true, spreadsheetId: ROOT2_SPREADSHEET_ID };
}

/**
 * Creates all sheet tabs with headers across the three configured spreadsheets.
 * @returns {Object} summary of sheets created/updated
 */
function initializeSpreadsheets() {
  var props = PropertiesService.getScriptProperties();
  var ids = {
    cms: props.getProperty('CMS_SPREADSHEET_ID'),
    forms: props.getProperty('FORMS_SPREADSHEET_ID'),
    settings: props.getProperty('SETTINGS_SPREADSHEET_ID'),
  };

  if (!ids.cms || ids.cms.indexOf('REPLACE_') === 0) {
    throw new Error('Set CMS_SPREADSHEET_ID in Script Properties first.');
  }
  if (!ids.forms || ids.forms.indexOf('REPLACE_') === 0) {
    throw new Error('Set FORMS_SPREADSHEET_ID in Script Properties first.');
  }
  if (!ids.settings || ids.settings.indexOf('REPLACE_') === 0) {
    throw new Error('Set SETTINGS_SPREADSHEET_ID in Script Properties first.');
  }

  var summary = { cms: [], forms: [], settings: [] };

  CMS_SHEETS.forEach(function (name) {
    ensureSheetWithHeaders_(SpreadsheetApp.openById(ids.cms), name);
    summary.cms.push(name);
  });

  FORMS_SHEETS.forEach(function (name) {
    ensureSheetWithHeaders_(SpreadsheetApp.openById(ids.forms), name);
    summary.forms.push(name);
  });

  SETTINGS_SHEETS.forEach(function (name) {
    ensureSheetWithHeaders_(SpreadsheetApp.openById(ids.settings), name);
    summary.settings.push(name);
  });

  Logger.log('Initialized spreadsheets: ' + JSON.stringify(summary));
  return summary;
}

function ensureSheetWithHeaders_(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  var headers = getHeadersForSheet_(sheetName);
  var existing = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];

  if (!existing.length || existing[0] !== 'id') {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e8f0fe');
  }
}

/**
 * Inserts sample rows when sheets are empty (safe to re-run — skips non-empty tabs).
 */
function seedSampleData() {
  initializeSpreadsheets();
  var now = new Date().toISOString();
  var samples = buildSampleRows_(now);

  Object.keys(samples).forEach(function (sheetName) {
    var sheetResult = getSheet_(sheetName);
    if (!sheetResult.ok) {
      Logger.log('Skip seed for ' + sheetName + ': ' + sheetResult.error);
      return;
    }
    var sheet = sheetResult.value;
    if (sheet.getLastRow() > 1) {
      Logger.log('Skip seed for ' + sheetName + ' (already has data)');
      return;
    }
    samples[sheetName].forEach(function (record) {
      ensureHeaders_(sheet, sheetName, record);
      appendRecord_(sheet, record);
    });
    Logger.log('Seeded ' + samples[sheetName].length + ' row(s) in ' + sheetName);
  });
}

function buildSampleRows_(now) {
  return {
    Hero: [
      {
        id: 'hero-1',
        title: 'Build the Future AI Workforce from STEM Excellence',
        subtitle: 'AI Talent · Training · Workforce Solutions',
        description:
          'ROOT2 STEM AI equips scientists, graduates, and professionals with production-ready AI skills—from prompt engineering to biomedical AI evaluation.',
        image: '/images/logo.png',
        badge: 'STEM × AI Career Platform',
        cta_primary: 'Explore Programs',
        cta_primary_link: '/programs',
        cta_secondary: 'Upcoming Workshops',
        cta_secondary_link: '/workshops',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    About: [
      {
        id: 'about-mission',
        section: 'mission',
        title: 'Our Mission',
        subtitle: 'STEM minds. AI careers.',
        description:
          'We transform STEM excellence into job-ready AI capability—training talent that can evaluate models, annotate scientific data, and ship responsible AI systems.',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Programs: [
      {
        id: 'prog-1',
        title: 'Prompt Engineering Mastery',
        subtitle: 'Design prompts that perform in production',
        description: 'Learn structured prompting, evaluation loops, and domain-specific prompt libraries.',
        image: '/illustrations/prompt.svg',
        duration: '6 weeks',
        certificate: 'Yes',
        slug: 'prompt-engineering-mastery',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Workshops: [
      {
        id: 'ws-1',
        title: 'Intro to Generative AI for STEM',
        subtitle: 'Hands-on foundations',
        description: 'A practical weekend workshop covering LLMs, safe prompting, and STEM use cases.',
        image: '/illustrations/workshop.svg',
        date: '2026-08-22',
        venue: 'Online · Zoom',
        type: 'upcoming',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    CareerPaths: [
      {
        id: 'cp-1',
        title: 'Prompt Engineer',
        slug: 'prompt-engineer',
        subtitle: 'Craft high-signal AI interactions',
        overview: 'Prompt Engineers design, test, and refine prompts for products and research pipelines.',
        image: '/illustrations/prompt.svg',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Blogs: [
      {
        id: 'blog-1',
        title: 'Why STEM Graduates Are Ideal for AI Evaluation Roles',
        slug: 'stem-graduates-ai-evaluation',
        subtitle: 'Domain rigor meets model quality',
        description: 'How scientific thinking translates into high-value AI evaluation careers.',
        category: 'Careers',
        author: 'ROOT2 Editorial',
        image: '/illustrations/blog-1.svg',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Gallery: [
      {
        id: 'gal-1',
        title: 'STEM AI Workshop',
        category: 'workshop',
        media_type: 'image',
        image: '/illustrations/gallery-1.svg',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Testimonials: [
      {
        id: 'test-1',
        title: 'Priya S.',
        role: 'Life Sciences Graduate',
        description: 'ROOT2 helped me pivot into AI evaluation with confidence and a portfolio.',
        rating: 5,
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    FAQs: [
      {
        id: 'faq-1',
        title: 'Do I need a coding background?',
        category: 'General',
        answer: 'No — many tracks focus on evaluation, prompting, and domain expertise rather than software engineering.',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Downloads: [
      {
        id: 'dl-1',
        title: 'STEM to AI Career Guide',
        file_url: '#',
        file_type: 'PDF',
        category: 'Careers',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Footer: [
      {
        id: 'footer-1',
        title: 'ROOT2 STEM AI',
        subtitle: 'Building the Future AI Workforce from STEM Excellence',
        quick_links: 'About|/about,Programs|/programs,Contact|/contact',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Settings: [
      {
        id: 'settings-1',
        site_name: 'ROOT2 STEM AI',
        tagline: 'Building the Future AI Workforce from STEM Excellence',
        email: 'hello@root2stemai.com',
        phone: '+91 90000 00000',
        address: 'Bengaluru, India',
        logo: '/images/logo.png',
        favicon: '/favicon.ico',
        copyright: '© 2026 ROOT2 STEM AI. All rights reserved.',
      },
    ],
    SEO: [
      {
        id: 'seo-1',
        default_title: 'ROOT2 STEM AI | AI Talent, Training & Workforce Solutions',
        default_description:
          'Build the future AI workforce from STEM excellence. Programs, workshops, and career paths in Prompt Engineering, AI Evaluation, Medical AI, and more.',
        canonical_base: 'https://root2stemai.com',
      },
    ],
    SocialLinks: [
      {
        id: 'soc-1',
        title: 'LinkedIn',
        platform: 'linkedin',
        url: 'https://linkedin.com/',
        icon: 'linkedin',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Statistics: [
      {
        id: 'stat-1',
        title: 'Learners Trained',
        value: 1200,
        suffix: '+',
        icon: 'school',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Partners: [
      {
        id: 'p-1',
        title: 'Nova Labs',
        subtitle: 'AI Research Partner',
        logo: '/illustrations/partner-1.svg',
        website: '#',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
    Team: [
      {
        id: 'team-1',
        title: 'Dr. Aisha Rahman',
        role: 'Founder & Program Director',
        bio: 'Interdisciplinary STEM educator focused on AI workforce readiness.',
        image: '/illustrations/team-1.svg',
        status: 'active',
        created_at: now,
        updated_at: now,
        display_order: 1,
      },
    ],
  };
}
