module.exports = {
    root: true,
    extends: [
        'google',
        'eslint-config-prettier',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:jest/recommended',
    ],
    plugins: ['@typescript-eslint', 'eslint-plugin-prettier'],
    env: {
        es6: true,
        node: true,
        jest: true,
    },
    parser: '@typescript-eslint/parser',
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts', '.tsx'],
            },
        },
    },
    ignorePatterns: ['*.d.ts'],
    rules: {
        strict: 'off',
        camelcase: 0,
        eqeqeq: 'error',
        indent: 'off',
        'import/prefer-default-export': 0,
        'no-restricted-syntax': 0,
        'func-names': 'warn',
        'max-len': 0,
        'no-console': 0,
        'no-continue': 0,
        'no-await-in-loop': 0,
        'import/extensions': 0,
        'react/require-default-props': 0,
        'comma-dangle': 'off',
        'no-param-reassign': [
            'error',
            {
                props: false,
            },
        ],
        'prettier/prettier': 'error',
        'no-unused-vars': 'off',
        'require-jsdoc': 'off',
        'new-cap': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                ignoreRestSiblings: true,
            },
        ],
        '@typescript-eslint/no-shadow': ['error'],
    },
    "prettier/prettier": [
        "error",
        {
        "endOfLine": "auto"
        }
    ],
    overrides: [
        {
            files: ['**/*.test.ts'],
            rules: {
                'jest/no-if': 'error',
                'jest/require-top-level-describe': 'error',
                'jest/consistent-test-it': ['error', { fn: 'test' }],
                'jest/valid-title': [
                    'warn',
                    {
                        mustNotMatch: [
                            '\\.$',
                            'Titles should not end with a full-stop',
                        ],
                        mustMatch: {
                            test: [
                                new RegExp(`^When.*?then.*?$`, 'u').source,
                                "A test name must conform to the standard pattern of 'When {scenario}, then {expectation}",
                            ],
                            it: [
                                new RegExp(`^When.*?then.*?$`, 'u').source,
                                "A test name must conform to the standard pattern of 'When {scenario}, then {expectation}",
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
