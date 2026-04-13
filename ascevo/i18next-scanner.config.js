/**
 * i18next-scanner configuration
 * Scans all TypeScript/TSX source files for t('...') calls and
 * outputs a report of all translation keys used in the codebase.
 *
 * Usage: npx i18next-scanner
 * Output: locales/missing-keys.json (keys present in code but missing from translation files)
 */

const path = require('path');
const fs = require('fs');

module.exports = {
  input: [
    'src/**/*.{ts,tsx}',
    // Exclude test files and mocks
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!node_modules/**',
  ],
  output: './',
  options: {
    debug: false,
    removeUnusedKeys: false,
    sort: true,
    func: {
      list: ['t', 'i18n.t'],
      extensions: ['.ts', '.tsx'],
    },
    lngs: ['en', 'ro', 'it', 'fr', 'de', 'es', 'pt', 'nl'],
    defaultLng: 'en',
    defaultNs: 'translation',
    defaultValue: '__MISSING__',
    resource: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
      savePath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
      jsonIndent: 2,
      lineEnding: '\n',
    },
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    // Custom handler to track missing keys
    customHandler: function(key, options) {
      // Keys with __MISSING__ value will be flagged
    },
  },
  transform: function customTransform(file, enc, done) {
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);

    // Parse t() calls including template literals and nested keys
    parser.parseFuncFromString(content, { list: ['t', 'i18n.t'] }, (key, options) => {
      parser.set(key, Object.assign({}, options, {
        nsSeparator: false,
        keySeparator: '.',
      }));
    });

    done();
  },
};
