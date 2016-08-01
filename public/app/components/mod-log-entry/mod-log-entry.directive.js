/* Directive for dynamically generating a template for the display of an entry
** to the mod log.
** Mod log entry data from the server is passed in as 'entry' and rendered HTML
** describing the visualisation of this entry is generated.
**
** The following strings are produced for each entry type:
**
** addmod/remove mod
** <mod1> added/removed <mod2> as a moderator.
**
** make-subbranch-request
** <childmod> made a subbranch request to <parentbranch>.
**
** answer-subbranch-request
** <parentmod> accepted/rejected a subbranch request to <parentbranch> made by <childmod> on <childbranch>.
*/

var app = angular.module('wecoApp');

function getLogActionVerb(action) {
  if(action == 'addmod') {
    return 'added';
  } else if(action == 'removemod') {
    return 'removed';
  } else {
    return '';
  }
}

function getTemplate(entry) {
  var templateStr = '<div class="time">{{ entry.date | date: \'dd MMMM yyyy HH:mm\' }}</div>';

  switch (entry.action) {
    case 'removemod':
    case 'addmod':
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a>' +
          ' ' + getLogActionVerb(entry.action) + ' ' +
          '<a ui-sref="weco.profile.about({ username: entry.data })">{{ entry.data }}</a>' +
          ' as a moderator.' +
        '</div>';
    case 'make-subbranch-request':
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a>' +
          ' made a SubBranch Request to ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: entry.data })">{{ entry.data }}</a>.' +
        '</div>';
    case 'answer-subbranch-request':
      var data = JSON.parse(entry.data);
      return templateStr +
        '<div class="entry">' +
          '<a ui-sref="weco.profile.about({ username: entry.username })">{{ entry.username }}</a> ' +
           data.response + 'ed a SubBranch Request to ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: \'' + data.parentid + '\' })">' + data.parentid + '</a>' +
          ' made by ' +
          '<a ui-sref="weco.profile.about({ username: \'' + data.childmod + '\' })">' + data.childmod + '</a>' +
          ' from ' +
          '<a ui-sref="weco.branch.nucleus.about({ branchid: \'' + data.childid + '\' })">' + data.childid + '</a>.' +
        '</div>';
    default:
      return '';
  }
}

app.directive('modLogEntry', ['$compile', function($compile) {

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
