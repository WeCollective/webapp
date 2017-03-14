import angular from 'angular';
import ENV from './env.config.js';

let app = angular.module('wecoApp', []);
app.config('ENV', ENV);
