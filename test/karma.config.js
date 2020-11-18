module.exports = function (config) {
  config.set({
      basePath: '../.',
      frameworks: ['mocha', 'chai'],
      plugins: ['karma-chrome-launcher', 'karma-chai', 'karma-mocha', 'karma-mocha-reporter'],
      files: [
        { pattern: 'scripts/taxonomy.js', type: 'module', included: false },
        { pattern: 'test/unit/taxonomy.test.js', type: 'module' },
        {
          pattern: 'test/features/**/*.json',
          watched: true,
          included: false,
          served: true
        }
      ],
      reporters: ['mocha'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      browsers: ['ChromeHeadless' /*, 'ChromeDebugging'*/],
      singleRun: true,
      concurrency: Infinity,
      customLaunchers: {
        ChromeDebugging: {
          base: 'Chrome',
          flags: [ '--remote-debugging-port=9333' ]
        }
      },
  })
}