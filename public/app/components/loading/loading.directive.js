/* Component to indicate loading on a DOM element.
** Usage:
**  <div>               - Parent must be position: relative
**    <div loading>     - Root element upon which to superimpose a loading indicator
**      ...             - Element's usual child content
**    </div>
**  </div>
*/

var app = angular.module('wecoApp');
app.directive('loading', function() {
  return {
    restrict: 'A',
    templateUrl: '/app/components/loading/loading.view.html',
    scope: {
      when: '&'
    },
    replace: false,
    transclude: true
  };
});
