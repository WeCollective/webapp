import Injectable from 'utils/injectable';

class WriteCommentComponent extends Injectable {
  constructor(...injections) {
    super(WriteCommentComponent.$inject, injections);

    this.bindToController = {
      onSubmit: '&',
      originalCommentText: '&',
      parentid: '@',
      placeholder: '@',
      postid: '@',
      update: '=',
    };
    this.controller = 'WriteCommentController';
    this.controllerAs = 'WriteComment';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/comments/write-comment/view.html';
  }
}

WriteCommentComponent.$inject = [];

export default WriteCommentComponent;
