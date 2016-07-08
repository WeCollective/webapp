'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['about', 'settings', 'moderators'];
  $scope.tabStates =
    ['weco.branch.nucleus.about({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.settings({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.moderators({ "branchid": "' + $scope.branchid + '"})'];

   // modify newlines of \n form to HTML <br> tag form for proper display
   $scope.addHTMLLineBreaks = function(str) {
     if(str) {
       return str.split('\n').join('<br>');
     }
   };
}]);
