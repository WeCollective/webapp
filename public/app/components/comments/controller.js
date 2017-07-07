import Injectable from 'utils/injectable';

class CommentsController extends Injectable {
  constructor(...injections) {
    super(CommentsController.$inject, injections);

    this.comments = [];
    this.controls = {
      sortBy: {
        items: [
          'points',
          'replies',
          'date',
        ],
        selectedIndex: 0,
      }
    };
    this.isLoading = false;

    this.reloadComments = this.reloadComments.bind(this);
    this.scrollCb = this.scrollCb.bind(this);

    let listeners = [];

    listeners.push(this.$rootScope.$watch(() => this.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.reloadComments();
    }));

    listeners.push(this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, this.scrollCb));

    listeners.push(this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, this.reloadComments));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

    this.reloadComments();
  }

  getComments(lastCommentId) {
    const errorCb = err => {
      if (err.status !== 404) {
        this.AlertsService.push('error', 'Error loading comments.');
      }

      this.isLoading = false;
    };

    const successCb = response => this.$timeout(() => {
      const isSingleComment = !Array.isArray(response);

      let comments = [];

      if (isSingleComment) {
        comments.push(response);
      }
      else {
        // if lastCommentId was specified we are fetching _more_ comments, so append them
        comments = this.comments;
        comments = comments.concat(response);
      }

      this.comments = comments;
      this.isLoading = false;
    });

    if (this.isLoading === true) return;

    this.isLoading = true;

    if (this.isCommentPermalink()) {
      this.CommentService.fetch(this.$state.params.postid, this.$state.params.commentid)
        .then(successCb)
        .catch(errorCb);
    }
    else {
      // fetch all the comments for this post
      const sortBy = this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase();

      this.CommentService.getMany(this.$state.params.postid, undefined, sortBy, lastCommentId)
        .then(successCb)
        .catch(errorCb);
    }
  }

  isCommentPermalink() {
    return this.$state.current.name === 'weco.branch.post.comment';
  }

  reloadComments() {
    this.comments = [];
    this.getComments();
  }

  scrollCb(name) {
    if (name !== 'CommentsScrollToBottom') return;

    if (this.comments.length > 0) {
      this.getComments(this.comments[this.comments.length - 1].id);
    }
  }
}

CommentsController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'CommentService',
  'EventService',
  'PostService',
];

export default CommentsController;
