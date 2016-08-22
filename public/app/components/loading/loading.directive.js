/* Component to indicate loading on a DOM element.
** Usage:
**  <div>               - Parent must be position: relative
**    <div loading>     - Root element upon which to superimpose a loading indicator
**      ...             - Element's usual child content
**    </div>
**  </div>
*/

var app = angular.module('wecoApp');
app.directive('loading', ['$compile', function($compile) {
  return {
    restrict: 'A',
    templateUrl: '/app/components/loading/loading.view.html',
    scope: {
      when: '&'
    },
    replace: false,
    transclude: true,
    link: function($scope, element, attrs, ctrl, transclude) {
      /*  Here we perform transclusion manually, instead of using ng-transclude.
      **  This is because ng-transclude automatically assigns the transcluded
      **  content a new *child* scope of the transcluded contents's context.
      **  However, we want the transcluded html to keep the *same* scope of its
      **  context so that its behaviour is unaffected, and changes made within it
      **  are reflected in it's context's scope.
      **
      **  To do this, we make the scope of the transcluded content that of
      **  the parent scope of this directive. (even though the scope
      **  is isolate, its $parent is actually still that of its context,
      **  there just isn't any prototypical inheritance).
      **  The directive's context ($parent) and the context of the transcluded
      **  content are the same, so the transcluded content keeps the scope
      **  of its parent, as desired.
      **
      **  This is implemented through use of the transclude function.
      **  The second param clones the transcluded html and assigns it the scope
      **  supplied in the first parameter. You can then do with it as you want,
      **  and so we append it to the directive template (having removed ng-transclude
      **  from the end of the template also).
      */
      transclude($scope.$parent, function(clone, scope) {
        element.append(clone);
      });
    }
  };
}]);
