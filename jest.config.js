module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/core/**/*.{ts,js}'],
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: ['./test/setup/dom.js']
};
