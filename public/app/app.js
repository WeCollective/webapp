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

// REGISTER COMPONENTS
import ComponentRegistrar from 'utils/component-registrar';
let registrar = new ComponentRegistrar('wecoApp');

// Services
import API from 'data/api.service';
registrar.service('API', API);
import UserService from 'data/user.service';
registrar.service('UserService', UserService);

// Controllers
import AppController from 'app.controller';
registrar.controller('AppController', AppController);
import HomeController from 'pages/home/home.controller';
registrar.controller('HomeController', HomeController);
