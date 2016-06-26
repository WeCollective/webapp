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

  var modalInputArgs = {};
  Modal.getInputArgs = function() {
    return modalInputArgs;
  };

  var modalResolve;
  var modalReject;
  Modal.open = function(url, args) {
    templateUrl = url;
    isOpen = true;
    modalInputArgs = args;

    return new Promise(function(resolve, reject) {
      modalResolve = resolve;
      modalReject = reject;
    });
  };

  Modal.OK = function() {
    isOpen = false;
    modalResolve(true);
  };
  Modal.Cancel = function() {
    isOpen = false;
    modalResolve(false);
  };
  Modal.Error = function() {
    modalReject();
  };

  return Modal;
});
