// APP DEPENDENCIES
import angular from 'angular';
import UIRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';
import ngMarked from 'angular-marked';
import ngGoogleAnalytics from 'angular-google-analytics';

let app = angular.module(
  'wecoApp', [
    UIRouter,
    ngAnimate,
    ngSanitize,
    ngFileUpload,
    ngMarked,
    ngGoogleAnalytics
  ]
);

// CONSTANTS
import ENV from 'env.config.js';
app.constant('ENV', ENV);

import NotificationTypes from 'components/notification/notification-types.config.js';
app.constant('NotificationTypes', NotificationTypes);

// FILTERS
import AppFilters from 'app.filters.js';
app.filter('reverse', AppFilters.reverse);
app.filter('capitalize', AppFilters.capitalize);

// CONFIG
import AppConfig from 'app.config.js';
import AppRoutes from 'app.routes.js';
app.config(['markedProvider', AppConfig.markdown]);
app.config(['$sceDelegateProvider', AppConfig.urlWhitelist]);
app.config(['AnalyticsProvider', 'ENV', AppConfig.analytics]);
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', AppRoutes]);

// CONTROLLERS
import AppController from 'app.controller.js';
app.controller('AppController', AppController);

import HomeController from 'pages/home/home.controller.js';
app.controller('HomeController', HomeController);
