import Injectable from 'utils/injectable';

class CommentInputBoxComponent extends Injectable {
  constructor(...injections) {
    super(CommentInputBoxComponent.$inject, injections);

    this.bindToController = {
      onSubmit: '&',
      originalCommentText: '&',
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
    this.templateUrl = '/app/components/comments/input/view.html';
  }
}

CommentInputBoxComponent.$inject = [];

export default CommentInputBoxComponent;
