import type { Config } from 'jest';
const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        moduleResolution: 'node',
      },
    }],
  },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
export default config;
