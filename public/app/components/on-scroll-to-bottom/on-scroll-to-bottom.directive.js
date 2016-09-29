var app = angular.module('wecoApp');
app.directive('onScrollToBottom', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var fn = scope.$eval(attrs.onScrollToBottom);
      element.on('scroll', function(e) {
        if(element[0].scrollTop + element[0].offsetHeight >= element[0].scrollHeight) {
          scope.$apply(fn);
        }
      });
    }
  };
});
