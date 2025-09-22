import type { Config } from 'jest'

const config: Config = {
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
}

export default config
