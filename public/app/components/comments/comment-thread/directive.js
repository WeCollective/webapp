import Injectable from 'utils/injectable';

class CommentThreadComponent extends Injectable {
  constructor(...injections) {
    super(CommentThreadComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = false;
    this.scope = {};
    this.bindToController = {
      comments: '=',
      sortBy: '='
    };
    this.templateUrl = '/app/components/comments/comment-thread/view.html';
    this.controller = 'CommentThreadController';
    this.controllerAs = 'CommentThread';
  }
}
CommentThreadComponent.$inject = [];

export default CommentThreadComponent;
