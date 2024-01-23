module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  moduleNameMapper: {
    "^preact(/(.*)|$)": "preact$1",
    '\\.(css|less)$': 'identity-obj-proxy',
    //"\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/mocks/fileMock.js",
    //"\\.(css|less|scss|sass)$": "<rootDir>/mocks/fileMock.js"
    // ... other mappings ...
  },
  /*
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {},
  */
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    "/node_modules/(?!pdfjs-dist)"
  ]
  // ... other configurations ...
};

