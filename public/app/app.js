// APP DEPENDENCIES
import angular from 'angular';
import UIRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';
import ngMarked from 'angular-marked';
import ngGoogleAnalytics from 'angular-google-analytics';
import CacheFactory from 'angular-cache';

let app = angular.module(
  'wecoApp', [
    UIRouter,
    ngAnimate,
    ngSanitize,
    ngFileUpload,
    ngMarked,
    ngGoogleAnalytics,
    CacheFactory
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

// REGISTER COMPONENTS
import ComponentRegistrar from 'utils/component-registrar';
let registrar = new ComponentRegistrar('wecoApp');

// Config
import AppConfig from 'app.config';
registrar.config(AppConfig);
import AppRoutes from 'app.routes';
registrar.config(AppRoutes);

// Services
import API from 'data/api.service';
registrar.service('API', API);
import UserService from 'data/user.service';
registrar.service('UserService', UserService);
import AlertsService from 'components/alerts/alerts.service';
registrar.service('AlertsService', AlertsService);
import TooltipService from 'components/tooltip/tooltip.service';
registrar.service('TooltipService', TooltipService);

// Controllers
import AppController from 'app.controller';
registrar.controller('AppController', AppController);
import HomeController from 'pages/home/home.controller';
registrar.controller('HomeController', HomeController);
import AuthController from 'pages/auth/auth.controller';
registrar.controller('AuthController', AuthController);
import VerifyController from 'pages/auth/verify/verify.controller';
registrar.controller('VerifyController', VerifyController);
import ResetPasswordController from 'pages/auth/reset-password/reset-password.controller';
registrar.controller('ResetPasswordController', ResetPasswordController);

// Components
import NavBarComponent from 'components/nav-bar/nav-bar.directive';
import NavBarController from 'components/nav-bar/nav-bar.controller';
registrar.directive('navBar', NavBarComponent);
registrar.controller('NavBarController', NavBarController);

import AlertsComponent from 'components/alerts/alerts.directive';
registrar.directive('alerts', AlertsComponent);

import TooltipComponent from 'components/tooltip/tooltip.directive';
registrar.directive('tooltip', TooltipComponent);
