import Injectable from 'utils/injectable';

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
    this.templateUrl = '/app/components/comments/thread/view.html';
  }
}

CommentThreadComponent.$inject = [];

export default CommentThreadComponent;
