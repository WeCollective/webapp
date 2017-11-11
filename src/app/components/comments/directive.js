import Injectable from 'utils/injectable';
import View from './view.html';

class CommentsComponent extends Injectable {
  constructor(...injections) {
    super(CommentsComponent.$inject, injections);

    this.bindToController = {};
    this.controller = 'CommentsController';
    this.controllerAs = 'Comments';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.template = View;
  }
}

CommentsComponent.$inject = [];

export default CommentsComponent;
