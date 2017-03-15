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
import ENV from 'env.config';
app.constant('ENV', ENV);

import NotificationTypes from 'components/notification/notification-types.config.js';
app.constant('NotificationTypes', NotificationTypes);

// FILTERS
import AppFilters from 'app.filters';
app.filter('reverse', AppFilters.reverse);
app.filter('capitalize', AppFilters.capitalize);

// CONFIG
import AppConfig from 'app.config';
import AppRoutes from 'app.routes';
app.config(['markedProvider', AppConfig.markdown]);
app.config(['$sceDelegateProvider', AppConfig.urlWhitelist]);
app.config(['AnalyticsProvider', 'ENV', AppConfig.analytics]);
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', AppRoutes]);

// SERVICES
import API from 'data/api.service';
app.service('API', API);

import UserService from 'data/user.service';
app.service('UserService', UserService);

// CONTROLLERS
import AppController from 'app.controller';
app.controller('AppController', AppController);

import HomeController from 'pages/home/home.controller';
app.controller('HomeController', HomeController);
