import angular from 'angular';
import ENV from './env.config.js';
import AppConfig from './app.config.js';
import AppFilters from './app.filters.js';
import NotificationTypes from './components/notification/notification-types.config.js';

// app dependency modules
import UIRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';
import marked from 'marked';
import ngGoogleAnalytics from 'angular-google-analytics';

let app = angular.module(
  'wecoApp', [
    UIRouter,
    ngAnimate,
    ngSanitize,
    ngFileUpload,
    marked,
    ngGoogleAnalytics
    // ,'api'
  ]
);

// CONSTANTS
app.constant('NotificationTypes', NotificationTypes);

// CONFIG
app.config('ENV', ENV);
app.config(['markedProvider', AppConfig.markdown]);
app.config(['$sceDelegateProvider', AppConfig.urlWhitelist]);
app.config(['AnalyticsProvider', 'ENV', AppConfig.analytics]);

// FILTERS
app.filter('reverse', AppFilters.reverse);
app.filter('capitalize', AppFilters.capitalize);
