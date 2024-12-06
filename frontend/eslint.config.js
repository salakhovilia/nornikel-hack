import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import eslintParserTypeScript from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJSXA11y from 'eslint-plugin-jsx-a11y';

export default [
    {
        files: ['vite.config.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.eslint.json',
                projectService: true,
            },
        },
        rules: {
            'import/no-default-export': 'off',
        },
    },
    {
        ignores: ['.eslintrc'],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parser: eslintParserTypeScript,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.json',
            },
        },

        plugins: {
            '@typescript-eslint': eslintPluginTypeScript,
            prettier: eslintPluginPrettier,
            'unused-imports': eslintPluginUnusedImports,
            react: eslintPluginReact,
            import: eslintPluginImport,
            'jsx-a11y': eslintPluginJSXA11y,
        },
        rules: {
            'linebreak-style': 'off',
            'no-console': 'off',
            'prettier/prettier': [
                'error',
                {
                    tabWidth: 4,
                },
            ],
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-throw-literal': 'off',
            'react/jsx-key': 'error',
            'react/no-danger': 'off',
            'react/prop-types': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/require-default-props': [
                'warn',
                {
                    ignoreFunctionalComponents: true,
                },
            ],
            'jsx-a11y/label-has-associated-control': [
                'error',
                {
                    required: {
                        some: ['nesting', 'id'],
                    },
                },
            ],
            'no-underscore-dangle': 'off',
            '@typescript-eslint/no-base-to-string': 'error',
            '@typescript-eslint/no-unnecessary-type-constraint': 'off',
            'jsx-a11y/label-has-for': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
];
