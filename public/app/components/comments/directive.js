import Injectable from 'utils/injectable';

class CommentsComponent extends Injectable {
  constructor(...injections) {
    super(CommentsComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};
    this.bindToController = {};
    this.templateUrl = '/app/components/comments/view.html';
    this.controllerAs = 'Comments';
    this.controller = 'CommentsController';
  }
}

CommentsComponent.$inject = [];

export default CommentsComponent;