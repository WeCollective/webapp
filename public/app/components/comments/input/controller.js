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

    const date = Date.now();
    const username = this.UserService.user.username || '';
    const id = `${date}-${username}`;
    const parentid = this.parentid || '';
    const postid = this.postid || 0;
    const text = this.input || '';

    // Simulate response from the server.
    const newComment = {
      comments: [],
      data: {
        edited: false,
        date,
        text,
        creator: username,
        id,
      },
      date,
      down: 0,
      hasMoreComments: false,
      id,
      individual: 0,
      meta: {
        openReply: false,
        update: false,
      },
      parentid,
      postid,
      rank: 0,
      replies: 0,
      up: 0,
      votes: {
        down: 0,
        individual: 0,
        up: 0,
      },
    };

    this.isLoading = false;
    this.input = '';

    // Update an existing comment.
    // NB: The supplied "parentid" is actually the id of the comment to be edited.
    if (this.update) {
      this.parentcomment.text = text;
      this.parentcomment.data.text = text;

      this.CommentService.update(postid, parentid, text)
        .catch(() => this.AlertsService.push('error', 'Error editing comment.'));

      this.onSubmit()(newComment, this.parentcomment);
    }
    else {
      this.CommentService.create({
        parentid,
        postid,
        text,
      })
        .then(id => {
          newComment.id = id;
        })
        .catch(err => {
          if (err.status === 403) {
            this.AlertsService.push('error', 'Please log in or create an account to comment.');
          }
          else {
            this.AlertsService.push('error', 'Error posting comment.');
          }
        });

      this.onSubmit()(newComment, this.parentcomment);
    }
  }
}

CommentInputBoxController.$inject = [
  '$scope',
  '$rootScope',
  '$timeout',
  'AlertsService',
  'CommentService',
  'UserService',
];

export default CommentInputBoxController;
