'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusController', ['$scope', '$state', '$timeout', 'Branch', 'User', 'Alerts', function($scope, $state, $timeout, Branch, User, Alerts) {
  $scope.tabItems = ['about', 'moderators'];
  $scope.tabStates =
    ['weco.branch.nucleus.about({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.moderators({ "branchid": "' + $scope.branchid + '"})'];

  // If this the auth'd user is a moderator of this branch, add the 'settings' tab
  $scope.$watch($scope.isModerator, function() {
   if($scope.branch.mods) {
     for(var i = 0; i < $scope.branch.mods.length; i++) {
       // is the authd user a mod of this branch?
       if($scope.branch.mods[i].username == User.me().username) {
         // add settings tab
         if($scope.tabItems.indexOf('settings') == -1) {
           $scope.tabItems.push('settings');
           $scope.tabStates.push('weco.branch.nucleus.settings({ "branchid": "' + $scope.branchid + '"})');
         }
         // add mod tools tab
         if($scope.tabItems.indexOf('mod tools') == -1) {
           $scope.tabItems.push('mod tools');
           $scope.tabStates.push('weco.branch.nucleus.modtools({ "branchid": "' + $scope.branchid + '"})');
         }
         // add flagged posts tab
         if($scope.tabItems.indexOf('flagged posts') == -1) {
           $scope.tabItems.push('flagged posts');
           $scope.tabStates.push('weco.branch.nucleus.flaggedposts({ "branchid": "' + $scope.branchid + '"})');
         }
       }
     }
   }
  });

  // modify newlines of \n form to HTML <br> tag form for proper display
  $scope.addHTMLLineBreaks = function(str) {
    if(str) {
      return str.split('\n').join('<br>');
    }
  };
}]);
