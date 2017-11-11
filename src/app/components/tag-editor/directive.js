import Injectable from 'utils/injectable';
import View from './view.html';

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
    this.template = View;
  }
}

TagEditorComponent.$inject = [];

export default TagEditorComponent;
