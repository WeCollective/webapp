var app = angular.module('wecoApp');
app.factory('Alerts', ['$timeout', function($timeout) {
  var Alerts = {};

  var queue = [];
  var duration = 5000;

  function purge() {
    queue = queue.filter(function(alert) {
      return alert.alive === true;
    });
  }

  function close(alert) {
    alert.alive = false;
    $timeout(function() {
      purge();
    }, 600);
  }

  Alerts.get = function () {
    return queue;
  };

  Alerts.push = function(type, text) {
    var alert = {
      type: type,
      text: text,
      alive: true
    };
    queue = [alert].concat(queue);

    $timeout(function() {
      close(alert);
    }, duration);
  };

  Alerts.close = function(idx) {
    close(queue[idx]);
  };

  return Alerts;
}]);
