import Injectable from 'utils/injectable';
import View from './view.html';

class CommentThreadComponent extends Injectable {
  constructor(...injections) {
    super(CommentThreadComponent.$inject, injections);

    this.bindToController = {
      comments: '=',
      sortBy: '=',
    };
    this.controller = 'CommentThreadController';
    this.controllerAs = 'Thread';
    this.replace = false;
    this.restrict = 'E';
    this.scope = {};
    this.template = View;
  }
}

CommentThreadComponent.$inject = [];

export default CommentThreadComponent;
