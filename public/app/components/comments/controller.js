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
      },
    };
    this.hasMoreComments = false;
    this.isLoading = false;

    this.reloadComments();

    const { sortBy } = this.controls;
    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.STATE_CHANGE_SUCCESS, this.reloadComments.bind(this)),
      this.$rootScope.$watch(() => sortBy.selectedIndex, (newValue, oldValue) => {
        if (newValue !== oldValue) this.reloadComments();
      }),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getAllCommentReplies(commentsArr) {
    return new Promise((resolve, reject) => {
      const promises = [];

      commentsArr.forEach(comment => {
        promises.push(new Promise((resolve2, reject2) => {
          this.getSingleCommentReplies(comment)
            .then(() => {
              if (comment.comments) {
                return this.getAllCommentReplies(comment.comments)
                  .then(resolve2)
                  .catch(reject2);
              }

              return resolve2();
            })
            .catch(reject2);
        }));
      });

      return Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  }

  getComments(lastCommentId) {
    const errorCb = err => {
      if (err.status !== 404) {
        this.AlertsService.push('error', 'Error loading comments.');
      }

      this.isLoading = false;
    };

    const successCb = res => this.$timeout(() => {
      const isSingleComment = !Array.isArray(res.comments);

      if (isSingleComment) {
        this.comments = [res];
        this.isLoading = false;
        return;
      }

      const comments = [
        ...this.comments,
        ...res.comments,
      ];
      this.comments = comments;

      this.hasMoreComments = res.hasMoreComments;

      this.getAllCommentReplies(comments)
        .then(() => this.$timeout(() => {
          this.isLoading = false;
        }));
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

  getSingleCommentReplies(comment) {
    return new Promise((resolve, reject) => {
      const lastCommentId = false;
      const sortBy = this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase();

      // fetch the replies to this comment, or just the number of replies
      return this.CommentService.getMany(comment.postid, comment.id, sortBy, lastCommentId)
        .then(res => this.$timeout(() => {
          comment.hasMoreComments = res.hasMoreComments;
          comment.comments = res.comments;
          return resolve();
        }))
        .catch(() => {
          this.AlertsService.push('error', 'Unable to get replies!');
          return reject();
        });
    });
  }

  isCommentPermalink() {
    return this.$state.current.name === 'weco.branch.post.comment';
  }

  onSubmitComment(comment, parent) { // eslint-disable-line no-unused-vars
    this.comments.unshift(comment);
  }

  reloadComments() {
    this.comments = [];
    this.getComments();
  }
}

CommentsController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'CommentService',
  'EventService',
  'PostService',
];

export default CommentsController;
