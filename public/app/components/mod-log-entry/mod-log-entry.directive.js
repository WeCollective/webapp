import Injectable from 'utils/injectable';

class ModLogEntryComponent extends Injectable {
  constructor(...injections) {
    super(ModLogEntryComponent.$inject, injections);

    this.restrict = 'A';
    this.replace = false;
    this.scope = {
      entry: '='
    };
  }

  link(scope, element, attrs) {
    if(scope.entry.action === 'answer-subbranch-request') scope.entry.data = JSON.parse(scope.entry.data);
    this.$templateRequest(`/app/components/mod-log-entry/${ scope.entry.action }.template.html`).then((template) => {
      element.html(template);
      this.$compile(element.contents())(scope);
    }, () => {
      console.error('Unable to get mod-log-entry template.');
    });
  }
}

ModLogEntryComponent.$inject = [
  '$compile',
  '$templateRequest'
];

export default ModLogEntryComponent;