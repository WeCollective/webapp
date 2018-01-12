import angular from 'angular';
import CacheFactory from 'angular-cache';
import ngAnimate from 'angular-animate';
import ngFileUpload from 'ng-file-upload';
import ngGoogleAnalytics from 'angular-google-analytics';
import ngMarked from 'angular-marked';
import ngSanitize from 'angular-sanitize';
import UIRouter from 'angular-ui-router';

import AppConfig from 'app.config';
import AppRoutes from 'app.routes';
import AppRun from 'app.run';

import constChartColours from 'components/chart/constants';
import constEnvironment from 'env.config';
import constNotificationTypes from 'components/notification/constants';

import filters from 'app.filters';

import initControllers from 'init.controllers';
import initDirectives from 'init.directives';
import initServices from 'init.services';

import Registrar from 'utils/component-registrar';

import buggyfill from 'viewport-units-buggyfill';

import Raven from 'raven-js';

Raven
  .config('https://d3f5977a31b0425f947ec4394bb26805@sentry.io/271026')
  .install();

 /*
 export class RavenErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Raven.captureException(err.originalError || err);
  }
}
*/
/*
setTimeout(() => {
	throw new Error('Hello from Weco!');
}, 5000);
*/

const appName = 'wecoApp';

const app = angular.module(appName, [
  CacheFactory,
  ngAnimate,
  ngFileUpload,
  ngGoogleAnalytics,
  ngMarked,
  ngSanitize,
  UIRouter,
]);

const registrar = new Registrar(app);

// Constants.
app.constant('ChartColours', constChartColours);
app.constant('ENV', constEnvironment);
app.constant('NotificationTypes', constNotificationTypes);

// Filters.
app.filter('capitalize', filters.capitalize);
app.filter('reverse', filters.reverse);

// Config.
registrar.config(AppConfig);
registrar.config(AppRoutes);

// Register components.
initControllers(registrar);
initDirectives(registrar);
initServices(registrar);

// Start the app.
registrar.run(AppRun);

// Fixes viewport units in bad, bad browsers.
buggyfill.init();
