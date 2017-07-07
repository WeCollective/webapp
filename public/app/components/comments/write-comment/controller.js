import Injectable from 'utils/injectable';

class WriteCommentController extends Injectable {
  constructor(...injections) {
    super(WriteCommentController.$inject, injections);

    this.comment = { text: '' };
    // todo make sure when loading, cannot double post as we deleted the node from the markup
    this.isLoading = false;

    this.$rootScope.$watch(() => this.update, () => {
      this.comment.text = this.update ? this.originalCommentText() : '';
    });
  }

  postComment() {
    this.$timeout(() => this.isLoading = true);
    this.comment.postid = this.postid;
    this.comment.parentid = this.parentid;

    // update an existing comment
    if(this.update) {
      // NB: if we are editing the existing comment, the supplied "parentid" is
      // actually the id of the comment to be edited
      this.CommentService.update(this.comment.postid, this.comment.parentid, this.comment.text).then(() => {
        this.$timeout(() => {
          this.isLoading = false;
          this.comment = { text: '' };
          this.onSubmit()(this.comment.id);
        });
      })
      .catch( () => {
        this.AlertsService.push('error', 'Error editing comment.');
        this.$timeout(() => { this.isLoading = false; });
      });
    } else {
      // create a new comment
      this.CommentService.create(this.comment).then((id) => {
        this.$timeout(() => {
          this.isLoading = false;
          this.comment = { text: '' };
          this.onSubmit()(id);
        });
      }).catch((err) => {
        if(err.status === 403) {
          this.AlertsService.push('error', 'Please log in or create an account to comment.');
        } else {
          this.AlertsService.push('error', 'Error posting comment.');
        }
        this.$timeout(() => { this.isLoading = false; });
      });
    }
  }

  /*
  cancelComment() {
    this.$timeout(() => {
      this.isLoading = false;
      this.comment = { text: '' };
      this.onCancel()();
    });
  }
  */
}

WriteCommentController.$inject = [
  '$rootScope',
  '$timeout',
  'AlertsService',
  'CommentService',
];

export default WriteCommentController;
