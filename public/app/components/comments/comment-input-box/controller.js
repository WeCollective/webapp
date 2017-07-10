import Injectable from 'utils/injectable';

class CommentInputBoxController extends Injectable {
  constructor(...injections) {
    super(CommentInputBoxController.$inject, injections);

    this.comment = this.getInitialState();
    // todo make sure when loading, cannot double post as we deleted the node from the markup
    this.isLoading = false;

    this.$rootScope.$watch(() => this.update, () => {
      this.comment.text = this.update ? this.originalCommentText() : '';
    });
  }

  getInitialState() {
    return {
      parentid: '',
      postid: 0,
      text: '',
    };
  }

  postComment() {
    this.isLoading = true;
    this.comment.postid = this.postid;
    this.comment.parentid = this.parentid;

    // update an existing comment
    if (this.update) {
      // NB: if we are editing the existing comment, the supplied "parentid" is
      // actually the id of the comment to be edited
      this.CommentService.update(this.comment.postid, this.comment.parentid, this.comment.text)
        .then(() => this.$timeout(() => {
          this.isLoading = false;
          this.comment = this.getInitialState();
          this.onSubmit()(this.comment.id);
        }))
        .catch(() => {
          this.AlertsService.push('error', 'Error editing comment.');
          this.isLoading = false;
        });
    }
    else {
      this.CommentService.create(this.comment)
        .then(id => this.$timeout(() => {
          this.isLoading = false;
          this.comment = { text: '' };
          this.onSubmit()(id);
        }))
        .catch(err => {
          if (err.status === 403) {
            this.AlertsService.push('error', 'Please log in or create an account to comment.');
          }
          else {
            this.AlertsService.push('error', 'Error posting comment.');
          }

          this.isLoading = false;
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

CommentInputBoxController.$inject = [
  '$rootScope',
  '$timeout',
  'AlertsService',
  'CommentService',
];

export default CommentInputBoxController;
