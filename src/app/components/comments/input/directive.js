import Injectable from 'utils/injectable';
import View from './view.html';

class CommentInputBoxComponent extends Injectable {
  constructor(...injections) {
    super(CommentInputBoxComponent.$inject, injections);

    this.bindToController = {
      onSubmit: '&',
      originalCommentText: '&',
      parentcomment: '=',
      parentid: '@',
      placeholder: '@',
      postid: '@',
      update: '=',
    };
    this.controller = 'CommentInputBoxController';
    this.controllerAs = 'Input';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.template = View;
  }
}

CommentInputBoxComponent.$inject = [];

export default CommentInputBoxComponent;
