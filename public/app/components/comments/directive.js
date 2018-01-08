import Injectable from 'utils/injectable';

class CommentsComponent extends Injectable {
  constructor(...injections) {
    super(CommentsComponent.$inject, injections);

    this.bindToController = {
      changeUrl: '=',
    };
    this.controller = 'CommentsController';
    this.controllerAs = 'Comments';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/comments/view.html';
  }
}

CommentsComponent.$inject = [];

export default CommentsComponent;
