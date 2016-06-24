"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'api']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  $stateProvider
    // Log In/Sign Up state
    .state('auth', {
      abstract: true,
      templateUrl: '/app/auth/auth.view.html',
      controller: 'authController'
    })
    .state('auth.login', {
      url: '/login'
    })
    .state('auth.signup', {
      url: '/signup'
    })
    // Abstract root state contains nav-bar
    .state('weco', {
      abstract: true,
      resolve: {
        authenticate: function() {
          // TODO
          console.log("This code is ran before any state is reached...");
        }
      },
      template: '<nav-bar></nav-bar><div class="full-page-nav" ui-view></div>'
    })
    // Homepage state
    .state('weco.home', {
      url: '/',
      templateUrl: '/app/home/home.view.html'
    })
    // Profile page
    .state('weco.profile', {
      url: '/u/:username',
      templateUrl: '/app/profile/profile.view.html',
      controller: 'profileController'
    });

});
