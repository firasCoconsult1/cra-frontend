const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-webpack')
    ],
    preprocessors: {
      '**/*.js': ['coverage'],
    },
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js', '.json', '.mjs'],
        // Add modules configuration
        modules: ['node_modules']
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: ['ts-loader', 'angular2-template-loader'],
            exclude: /node_modules/
          },
          {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
          },
          // Add rule for .mjs files (needed for ES modules)
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto'
          }
        ]
      },
      entry: './src/main.ts',
      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
      }
    },
    client: {
      clearContext: false,
      jasmine: {
        grep: process.env.npm_config_grep || ''
      }
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: ['progress', 'kjhtml', 'coverage']
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};