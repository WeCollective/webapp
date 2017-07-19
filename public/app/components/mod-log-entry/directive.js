import Injectable from 'utils/injectable';

class ModLogEntryComponent extends Injectable {
  constructor(...injections) {
    super(ModLogEntryComponent.$inject, injections);

    this.replace = false;
    this.restrict = 'A';
    this.scope = {
      entry: '=',
    };
  }

  // Params: scope, element, attrs
  link(scope, element) {
    if (scope.entry.action === 'answer-subbranch-request') {
      scope.entry.data = JSON.parse(scope.entry.data);
    }

    this.$templateRequest(`/app/components/mod-log-entry/templates/${scope.entry.action}.html`)
      .then(template => {
        element.html(template);
        this.$compile(element.contents())(scope);
      })
      .catch(() => console.error('Unable to get mod-log-entry template.'));
  }
}

ModLogEntryComponent.$inject = [
  '$compile',
  '$templateRequest',
];

export default ModLogEntryComponent;
