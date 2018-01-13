import Injectable from 'utils/injectable';

class CommentsController extends Injectable {
  constructor(...injections) {
    super(CommentsController.$inject, injections);

    this.comments = [];
    this.controls = {
      sortBy: {
        items: [{
          label: 'points',
          url: 'points',
        }, {
          label: 'replies',
          url: 'replies',
        }, {
          label: 'date',
          url: 'date',
        }],
        selectedIndex: -1,
        title: 'sorted by',
      },
    };
    this.sortBy = this.controls.sortBy.items.map(x => x.label);
    this.hasMoreComments = false;
    this.isLoading = false;

    this.setDefaultControls = this.setDefaultControls.bind(this);
    this.setDefaultControls();

    const { sortBy } = this.controls;
    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.STATE_CHANGE_SUCCESS, this.reloadComments.bind(this)),
      this.$rootScope.$watch(() => sortBy.selectedIndex, (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (this.changeUrl) {
            const { sortBy: sort } = this.controls;
            this.$location.search('sort', sort.items[sort.selectedIndex].url);
          }
          this.reloadComments();
        }
      }),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  exitSingleCommentView() {
    this.$state.go('weco.branch.post', {
      branchid: this.BranchService.branch.id,
      postid: this.PostService.post.id,
    });
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
      if (this.isCommentPermalink()) {
        this.comments = [res];
        this.isLoading = false;
        return;
      }

      const comments = [
        ...this.comments,
        ...res.comments,
      ];
      this.comments = comments;

      this.hasMoreComments = res.comments.length === this.API.limits().comments;

      this.getAllCommentReplies(comments)
        .then(() => this.$timeout(() => {
          this.isLoading = false;
        }));
    });

    if (this.isLoading === true) return;
    this.isLoading = true;

    const {
      commentid,
      postid,
    } = this.$state.params;

    if (this.isCommentPermalink()) {
      this.CommentService.fetch(postid, commentid)
        .then(successCb)
        .catch(errorCb);
    }
    else {
      // fetch all the comments for this post
      const { sortBy } = this.controls;
      const sort = sortBy.items[sortBy.selectedIndex].label.toLowerCase();

      this.CommentService.getMany(postid, undefined, sort, lastCommentId)
        .then(successCb)
        .catch(errorCb);
    }
  }

  getSingleCommentReplies(comment) {
    return new Promise((resolve, reject) => {
      const lastCommentId = false;
      const { sortBy } = this.controls;
      const sort = sortBy.items[sortBy.selectedIndex].label.toLowerCase();

      // fetch the replies to this comment, or just the number of replies
      return this.CommentService.getMany(comment.postid, comment.id, sort, lastCommentId)
        .then(res => this.$timeout(() => {
          comment.hasMoreComments = res.comments.length === this.API.limits().comments;
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

  setDefaultControls() {
    const query = this.$location.search();
    const defaultSortByIndex = 0;

    const { sortBy } = this.controls;
    const urlIndexSortBy = this.urlToItemIndex(query.sort, sortBy.items);
    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;

    this.reloadComments();
  }

  // Finds the item in array with the matching url value and returns its index.
  urlToItemIndex(str, arr = []) {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].url === str) {
        return i;
      }
    }
    return -1;
  }
}

CommentsController.$inject = [
  '$location',
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'API',
  'BranchService',
  'CommentService',
  'EventService',
  'PostService',
];

export default CommentsController;
