var app = angular.module('wecoApp');
app.factory('Modal', ['$timeout', function($timeout) {
  var Modal = {};

  var templateUrl = '';
  Modal.templateUrl = function() {
    return templateUrl;
  };

  var isOpen = false;
  Modal.isOpen = function() {
    return isOpen;
  };

  var modalInputArgs = {};
  Modal.getInputArgs = function() {
    return modalInputArgs;
  };
  var modalOutputArgs = {};
  Modal.getOutputArgs = function() {
    return modalOutputArgs;
  };

  var modalResolve;
  var modalReject;
  Modal.open = function(url, args) {
    // force change the template url so that controllers included on
    // the template are reloaded
    templateUrl = "";
    $timeout(function () {
      templateUrl = url;
    });
    isOpen = true;
    modalInputArgs = args;

    return new Promise(function(resolve, reject) {
      modalResolve = resolve;
      modalReject = reject;
    });
  };

  Modal.OK = function(args) {
    $timeout(function() {
      isOpen = false;
      if(args) {
        modalOutputArgs = args;
      }
      modalResolve(true);
    });
  };
  Modal.Cancel = function(args) {
    $timeout(function() {
      isOpen = false;
      if(args) {
        modalOutputArgs = args;
      }
      modalResolve(false);
    });
  };
  Modal.Error = function() {
    modalReject();
  };

  return Modal;
}]);
