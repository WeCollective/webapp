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
    this.controllerAs = 'CommentInput';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/comments/comment-input-box/view.html';
  }
}

CommentInputBoxComponent.$inject = [];

export default CommentInputBoxComponent;
