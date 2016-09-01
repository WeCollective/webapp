/* Directive for dynamically generating a template for the display of a
** notification on the notifications tab of the user profile.
** Notification data from the server is passed in as 'entry' and rendered HTML
** describing the visualisation of this entry is generated.
**
** The following strings are produced for each entry type:
**
** NEW_CHILD_BRANCH_REQUEST
** <username> as submitted a <parent branch request> to <branch>
**
*/

var app = angular.module('wecoApp');

app.directive('notificationEntry', ['$compile', 'NotificationTypes', function($compile, NotificationTypes) {

  function getTemplate(entry) {

    switch (entry.type) {
      case NotificationTypes.NEW_CHILD_BRANCH_REQUEST:
        return '' +
          '<div class="title">' +
            '<a ui-sref="weco.profile.about({ username: entry.data.username })">{{ entry.data.username }}</a> ' +
            'has submitted a parent branch request from <a ui-sref="weco.branch.nucleus.about({ branchid: entry.data.childid })">b/{{ entry.data.childid }}</a> ' +
            'to <a ui-sref="weco.branch.nucleus.about({ branchid: entry.data.parentid })">b/{{ entry.data.parentid }}</a>' +
          '</div>' +
          '<div class="description">received at {{ entry.date | date:\'hh:mm on dd of MMMM yyyy\' }}</div>';
      case NotificationTypes.CHILD_BRANCH_REQUEST_ANSWERED:
        return '' +
          '<div class="title">' +
            '<a ui-sref="weco.profile.about({ username: entry.data.username })">{{ entry.data.username }}</a> {{ entry.data.action }}ed ' +
            'your parent branch request from <a ui-sref="weco.branch.nucleus.about({ branchid: entry.data.childid })">b/{{ entry.data.childid }}</a> ' +
            'to <a ui-sref="weco.branch.nucleus.about({ branchid: entry.data.parentid })">b/{{ entry.data.parentid }}</a>' +
          '</div>' +
          '<div class="description">received at {{ entry.date | date:\'hh:mm on dd of MMMM yyyy\' }}</div>';
      case NotificationTypes.BRANCH_MOVED:
        return '' +
          '<div class="title">' +
            '<a ui-sref="weco.branch.nucleus.about({ branchid: entry.data.childid })">b/{{ entry.data.childid }}</a> was moved to ' +
            '<a ui-sref="weco.branch.nucleus.about({ branchid: entry.data.parentid })">b/{{ entry.data.parentid }}</a>' +
          '</div>' +
          '<div class="description">received at {{ entry.date | date:\'hh:mm on dd of MMMM yyyy\' }}</div>';
      default:
        return '';
    }
  }

  var linker = function(scope, element, attrs) {
    element.html(getTemplate(scope.entry));
    $compile(element.contents())(scope);
  };

  return {
    restrict: 'A',
    replace: false,
    link: linker,
    scope: {
      entry: '='
    }
  };
}]);
