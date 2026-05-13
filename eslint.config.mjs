import angularEslint from '@angular-eslint/eslint-plugin';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import rxjs from '@smarttools/eslint-plugin-rxjs';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores(['**/dist/', '**/node_modules/', '**/.angular/', '**/environments/', 'eslint.config.mjs']),
  ...compat.extends('eslint:recommended', 'plugin:@angular-eslint/recommended'),
  ...compat
    .extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended')
    .map(c => ({ ...c, files: ['**/*.ts'] })),
  {
    files: ['**/*.ts'],

    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@angular-eslint': angularEslint,
      '@smarttools/rxjs': rxjs
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.app.json'],
        tsconfigRootDir: __dirname
      }
    },

    rules: {
      '@smarttools/rxjs/finnish': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@smarttools/rxjs/no-unsafe-takeuntil': 'error',
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      // TODO: MZ: after migrating to NG21 '@angular-eslint/no-implicit-take-until-destroyed': 'error',

      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit'
        }
      ],

      '@typescript-eslint/parameter-properties': [
        'error',
        {
          allow: []
        }
      ],

      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/typedef': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      'prettier/prettier': ['warn', {endOfLine: "crlf"}],

      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSParameterProperty',
          message: 'Parameter properties są zabronione – używaj inject().'
        },
        {
          selector: 'NewExpression[callee.name=/.*Service$/]',
          message: 'Serwisy muszą być wstrzykiwane przez inject(), a nie tworzone przez `new`.'
        },
        {
          selector: 'NewExpression[callee.name=/^(Http|XMLHttpRequest)/]',
          message: 'Nie twórz ręcznie HTTP – używaj Angular HttpClient przez DI (inject()).'
        }
      ],

      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              'readonly-signature',
              'signature',

              'private-static-readonly-field',
              'private-static-field',
              '#private-static-readonly-field',
              '#private-static-field',
              'protected-static-readonly-field',
              'protected-static-field',
              'public-static-readonly-field',
              'public-static-field',

              'private-decorated-readonly-field',
              'private-decorated-field',
              'protected-decorated-readonly-field',
              'protected-decorated-field',
              'public-decorated-readonly-field',
              'public-decorated-field',

              'private-instance-readonly-field',
              'private-instance-field',
              '#private-instance-readonly-field',
              '#private-instance-field',
              'protected-instance-readonly-field',
              'protected-instance-field',
              'public-instance-readonly-field',
              'public-instance-field',

              'protected-abstract-readonly-field',
              'protected-abstract-field',
              'public-abstract-readonly-field',
              'public-abstract-field',

              'private-readonly-field',
              'private-field',
              '#private-readonly-field',
              '#private-field',
              'protected-readonly-field',
              'protected-field',
              'public-readonly-field',
              'public-field',

              'static-readonly-field',
              'static-field',
              'instance-readonly-field',
              'instance-field',
              'abstract-readonly-field',
              'abstract-field',

              'decorated-readonly-field',
              'decorated-field',

              'readonly-field',
              'field',

              'static-initialization',
              'public-constructor',

              'get',

              'set',

              'static-method',
              'decorated-method',
              'instance-method',
              'method'
            ],

            order: 'as-written'
          }
        }
      ],

      '@smarttools/rxjs/no-ignored-observable': 'error',
      '@smarttools/rxjs/no-exposed-subjects': 'error',
      '@smarttools/rxjs/no-internal': 'error'
    }
  },
  ...compat
    .extends('plugin:@angular-eslint/template/recommended', 'plugin:@angular-eslint/template/accessibility')
    .map(c => ({ ...c, files: ['**/*.html'] })),
  {
    files: ['**/*.html'],

    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/no-autofocus': 'off',
      '@angular-eslint/template/alt-text': 'off'
    }
  }
]);
