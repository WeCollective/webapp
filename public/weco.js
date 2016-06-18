"use strict";

var app = angular.module('wecoApp', ['ui.router']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // Abstract state parent to all other states in order to check auth status
  $stateProvider.state('weco', {
    abstract: true,
    resolve: {
      authenticate: function() {
        // TODO: check whether user authd, injecting auth service
        console.log("Checking auth status...");
      }
    },
    template: '<div class="full-page" ui-view></div>'
  })
  // Homepage state
  .state('weco.home', {
    url: '/',
    templateUrl: '/app/home/home.view.html'
  });
});

var app = angular.module('wecoApp');
app.directive('navBar', function() {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/nav/nav.view.html'
  };
});
