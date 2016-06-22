"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'api']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // Abstract state parent to all other states
  $stateProvider.state('weco', {
    abstract: true,
    resolve: {
      authenticate: function() {
        // TODO
        console.log("This code is ran before any state is reached...");
      }
    },
    template: '<div class="full-page" ui-view></div>'
  })
  // Homepage state
  .state('weco.home', {
    url: '/',
    templateUrl: '/app/home/home.view.html'
  })
  // Log In/Sign Up state
  .state('weco.auth', {
    abstract: true,
    templateUrl: '/app/auth/auth.view.html'
  })
  .state('weco.auth.login', {
    url: '/login'
  })
  .state('weco.auth.signup', {
    url: '/signup'
  });
});
