/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2022',
          module: 'CommonJS',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true,
        },
      },
    ],
  },
  rootDir: '..',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['<rootDir>/lib/**/*.ts', '<rootDir>/index.ts', '!**/*.d.ts'],
};
