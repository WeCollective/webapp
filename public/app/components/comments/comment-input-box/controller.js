import Injectable from 'utils/injectable';

class CommentInputBoxController extends Injectable {
  constructor(...injections) {
    super(CommentInputBoxController.$inject, injections);

    this.input = '';
    this.isLoading = false;

    let listeners = [];

    listeners.push(this.$rootScope.$watch(() => this.update, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this.input = newValue ? this.originalCommentText() : '';
      }
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  /*
  // method inaccessible at the moment
  cancelComment() {
    this.$timeout(() => {
      this.isLoading = false;
      this.inout = '';
      this.onCancel()();
    });
  }
  */

  handleSubmit() {
    if (this.isLoading === true) return;

    this.isLoading = true;

    const comment = {
      parentid: this.parentid || '',
      postid: this.postid || 0,
      text: this.input || '',
    };

    // update an existing comment
    if (this.update) {
      // NB: if we are editing the existing comment, the supplied "parentid" is
      // actually the id of the comment to be edited
      this.CommentService.update(comment.postid, comment.parentid, comment.text)
        .then(() => this.$timeout(() => {
          this.isLoading = false;
          this.input = '';
          this.onSubmit()(comment.id);
        }))
        .catch(() => {
          this.AlertsService.push('error', 'Error editing comment.');
          this.isLoading = false;
        });
    }
    else {
      this.CommentService.create(comment)
        .then(id => this.$timeout(() => {
          this.isLoading = false;
          this.input = '';
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
}

CommentInputBoxController.$inject = [
  '$scope',
  '$rootScope',
  '$timeout',
  'AlertsService',
  'CommentService',
];

export default CommentInputBoxController;
