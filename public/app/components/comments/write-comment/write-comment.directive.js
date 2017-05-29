import Injectable from 'utils/injectable';

class WriteCommentComponent extends Injectable {
  constructor(...injections) {
    super(WriteCommentComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};
    this.bindToController = {
      parentid: '&',
      postid: '&',
      onSubmit: '&',
      onCancel: '&',
      update: '=',
      placeholder: '&',
      originalCommentText: '&'
    };
    this.templateUrl = '/app/components/comments/write-comment/view.html';
    this.controller = 'WriteCommentController';
    this.controllerAs = 'WriteComment';
  }
}
WriteCommentComponent.$inject = [];

export default WriteCommentComponent;
