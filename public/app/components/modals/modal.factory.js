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

  var modalResolve;
  var modalReject;
  Modal.open = function(url) {
    templateUrl = url;
    isOpen = true;

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
