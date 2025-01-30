import tseslint from 'typescript-eslint';
import jestlint from 'eslint-plugin-jest';

export default tseslint.config(
    ...tseslint.configs.strict,
    jestlint.configs['flat/recommended'],
    {
        files: ['**/*.ts'],
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
            'comma-dangle': 'off',
            'no-param-reassign': [
                'error',
                {
                    props: false,
                },
            ],
            'no-unused-vars': 'warn',
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
    },
    {
        files: ['**/*.test.ts'],
        rules: {
            'jest/expect-expect': 'off',
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
    }
);
