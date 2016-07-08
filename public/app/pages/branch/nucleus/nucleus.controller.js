'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusController', ['$scope', '$state', '$timeout', 'Branch', 'User', function($scope, $state, $timeout, Branch, User) {
  $scope.tabItems = ['about', 'moderators'];
  $scope.tabStates =
    ['weco.branch.nucleus.about({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.moderators({ "branchid": "' + $scope.branchid + '"})'];

   // Watch for changes in the current branch
   // If this the auth'd user is a moderator of this branch, add the 'settings' tab
   $scope.$watch(function() {
     return $scope.branch.id;
   }, function() {
     if($scope.branch.mods && $scope.branch.mods.indexOf(User.me().username) > -1) {
       if($scope.tabItems.indexOf('settings') == -1) {
         $scope.tabItems.push('settings');
         $scope.tabStates.push('weco.branch.nucleus.settings({ "branchid": "' + $scope.branchid + '"})');
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
