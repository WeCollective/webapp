"use strict";

var app = angular.module('wecoApp', ['ui.router']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // Abstract state parent to all other states in order to check auth status
  $stateProvider.state('weco', {
    abstract: true,
    resolve: {
      authenticate: ['authFactory', function(authFactory) {
        // TODO: check whether user authd, injecting auth service
        console.log("Checking auth status...");
        console.log(authFactory.isLoggedIn());
      }]
    },
    template: '<div class="full-page" ui-view></div>'
  })
  // Homepage state
  .state('weco.home', {
    url: '/',
    templateUrl: '/app/home/home.view.html'
  })
  // Log In/Sign Up state
  .state('weco.login', {
    url: '/login',
    templateUrl: '/app/login/login.view.html'
  });
});
