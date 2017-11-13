import Injectable from 'utils/injectable';

class TagEditorComponent extends Injectable {
  constructor(...injections) {
    super(TagEditorComponent.$inject, injections);

    this.bindToController = {
      items: '=',
      max: '&',
      title: '&',
    };
    this.controller = 'TagEditorController';
    this.controllerAs = 'TagEditor';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/tag-editor/view.html';
  }
}

TagEditorComponent.$inject = [];

export default TagEditorComponent;
