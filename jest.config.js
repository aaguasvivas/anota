/** Pure-logic tests only (no React Native). ts-jest compiles to CommonJS. */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', esModuleInterop: true, isolatedModules: true } },
    ],
  },
};
