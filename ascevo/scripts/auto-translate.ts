/**
 * Auto-translate script
 * Reads new/missing keys from locales/en/translation.json and auto-translates
 * them into all 7 non-English languages using the OpenAI API.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx ts-node scripts/auto-translate.ts
 *
 * Options:
 *   --dry-run    Print translations without writing to files
 *   --key <key>  Translate only a specific key (e.g. "onboarding.language_title")
 *   --force      Re-translate all keys, even if already translated
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPPORTED_LANGUAGES = ['ro', 'it', 'fr', 'de', 'es', 'pt', 'nl'] as const;
type TargetLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_NAMES: Record<TargetLanguage, string> = {
  ro: 'Romanian',
  it: 'Italian',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  nl: 'Dutch',
};

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const KEY_FILTER = args.includes('--key') ? args[args.indexOf('--key') + 1] : null;

// ---------------------------------------------------------------------------
// Translation prompt — Growthovo brand voice
// ---------------------------------------------------------------------------

function buildPrompt(content: string, language: string): string {
  return `Translate the following self-improvement app content into ${language}. Maintain a direct, honest, slightly edgy tone — like a smart older sibling. Never sound corporate or overly motivational. Keep the same energy as the English version.

Return only the translated text, nothing else.

Content: ${content}`;
}

// ---------------------------------------------------------------------------
// OpenAI call
// ---------------------------------------------------------------------------

async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: buildPrompt(text, targetLanguage),
        },
      ],
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for consistent translations
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content?.trim() ?? text;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function readJson(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath: string, data: Record<string, any>): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Flatten a nested object into dot-notation keys.
 * e.g. { onboarding: { title: 'foo' } } → { 'onboarding.title': 'foo' }
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

/**
 * Set a value in a nested object using a dot-notation key.
 */
function setNestedValue(obj: Record<string, any>, key: string, value: string): void {
  const parts = key.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌍 Growthovo Auto-Translate Script');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'} | Force: ${FORCE}`);
  if (KEY_FILTER) console.log(`Key filter: ${KEY_FILTER}`);
  console.log('');

  // Load English source
  const enPath = path.join(LOCALES_DIR, 'en', 'translation.json');
  const enTranslations = readJson(enPath);
  const enFlat = flattenObject(enTranslations);

  // Filter keys if --key flag provided
  const keysToTranslate = KEY_FILTER
    ? Object.fromEntries(Object.entries(enFlat).filter(([k]) => k.startsWith(KEY_FILTER)))
    : enFlat;

  if (Object.keys(keysToTranslate).length === 0) {
    console.log('No keys to translate.');
    return;
  }

  let totalTranslated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const lang of SUPPORTED_LANGUAGES) {
    const langPath = path.join(LOCALES_DIR, lang, 'translation.json');
    const existing = readJson(langPath);
    const existingFlat = flattenObject(existing);

    console.log(`\n📝 Translating to ${LANGUAGE_NAMES[lang]} (${lang})...`);

    const updated = JSON.parse(JSON.stringify(existing)); // deep clone
    let langTranslated = 0;
    let langSkipped = 0;

    for (const [key, enValue] of Object.entries(keysToTranslate)) {
      // Skip if already translated (unless --force)
      if (!FORCE && existingFlat[key] && existingFlat[key] !== enValue && existingFlat[key] !== '__MISSING__') {
        langSkipped++;
        continue;
      }

      // Skip empty values
      if (!enValue.trim()) {
        langSkipped++;
        continue;
      }

      try {
        const translated = await translateText(enValue, LANGUAGE_NAMES[lang]);

        if (DRY_RUN) {
          console.log(`  [${key}]: "${enValue}" → "${translated}"`);
        } else {
          setNestedValue(updated, key, translated);
        }

        langTranslated++;
        totalTranslated++;

        // Rate limiting — avoid hitting OpenAI too fast
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err: any) {
        console.error(`  ❌ Error translating "${key}": ${err.message}`);
        totalErrors++;
      }
    }

    if (!DRY_RUN && langTranslated > 0) {
      writeJson(langPath, updated);
      console.log(`  ✅ Wrote ${langTranslated} translations to ${langPath}`);
    } else {
      console.log(`  ℹ️  ${langTranslated} translated, ${langSkipped} skipped`);
    }

    totalSkipped += langSkipped;
  }

  console.log('\n📊 Summary:');
  console.log(`  Translated: ${totalTranslated}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Errors: ${totalErrors}`);

  if (DRY_RUN) {
    console.log('\n⚠️  Dry run — no files were written. Remove --dry-run to apply changes.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
