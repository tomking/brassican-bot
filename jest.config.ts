import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': '@swc/jest',
    },
    modulePathIgnorePatterns: ['<rootDir>/build'],
};

export default config;
