var app = angular.module('wecoApp');
app.factory('Modal', function() {
  var Modal = {};

  var templateUrl = '';
  Modal.templateUrl = function() {
    return templateUrl;
  };

  var isOpen = false;
  Modal.isOpen = function() {
    return isOpen;
  };

  Modal.show = function(url) {
    templateUrl = url;
    isOpen = true;
  };

  return Modal;
});
