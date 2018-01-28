import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const { SortComments } = Constants.Filters;

class CommentsController extends Injectable {
  constructor(...injections) {
    super(CommentsController.$inject, injections);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultFilters = this.setDefaultFilters.bind(this);

    this.filters = {
      sortBy: {
        items: SortComments,
        selectedIndex: -1,
        title: 'sorted by',
      },
    };
    this.hasMoreComments = false;
    this.isInit = true;
    this.isWaitingForRequest = false;
    this.items = [];

    const fltrs = this.filters;
    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;
    this.sortBy = getFilterFlatItems(fltrs.sortBy);

    this.setDefaultFilters();

    const { events } = this.EventService;
    const listeners = [
      ...attachFilterListeners(this.$scope, fltrs, this.callbackDropdown),
      this.EventService.on(events.STATE_CHANGE_SUCCESS, this.reloadComments.bind(this)),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    if (this.changeUrl) {
      const { applyFilter } = this.UrlService;
      const { sortBy } = this.filters;
      applyFilter(sortBy, 'sort');
    }
    this.reloadComments();
  }

  exitSingleCommentView() {
    const { id: branchid } = this.BranchService.branch;
    const { id: postid } = this.PostService.post;
    this.$state.go('weco.branch.post', { branchid, postid });
  }

  getAllCommentReplies(commentsArr) {
    return new Promise((resolve, reject) => {
      let promises = [];

      commentsArr.forEach(comment => {
        const promise = new Promise((resolve2, reject2) => {
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
        });

        promises = [
          ...promises,
          promise,
        ];
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

      this.isWaitingForRequest = false;
    };

    const successCb = res => this.$timeout(() => {
      if (this.isCommentPermalink()) {
        this.items = [res];
        this.isWaitingForRequest = false;
        return;
      }

      const comments = [
        ...this.items,
        ...res.comments,
      ];
      this.items = comments;

      this.hasMoreComments = res.comments.length === this.API.limits().comments;

      this.getAllCommentReplies(comments)
        .then(() => this.$timeout(() => {
          this.isWaitingForRequest = false;
        }))
        .catch(() => this.$timeout(() => {
          this.isWaitingForRequest = false;
        }));
    });

    if (this.isWaitingForRequest === true) return;
    this.isWaitingForRequest = true;
    this.isInit = false;

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
      const { sortBy } = this.filters;
      const sort = this.UrlService.getFilterItemKey(sortBy, 'url');

      this.CommentService.getMany(postid, undefined, sort, lastCommentId)
        .then(successCb)
        .catch(errorCb);
    }
  }

  getSingleCommentReplies(comment) {
    return new Promise((resolve, reject) => {
      const lastCommentId = false;
      const { sortBy } = this.filters;
      const sort = this.UrlService.getFilterItemKey(sortBy, 'url');

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

  isPostType(type) {
    return this.PostService.post.type === type;
  }

  onSubmitComment(comment, parent) { // eslint-disable-line no-unused-vars
    this.items = [
      comment,
      ...this.items,
    ];
  }

  reloadComments() {
    this.items = [];
    this.getComments();
  }

  setDefaultFilters() {
    const { sortBy } = this.filters;
    const {
      getUrlSearchParams,
      urlToFilterItemIndex,
    } = this.UrlService;
    const { sort } = getUrlSearchParams();
    const defaultSortByIndex = 0;

    const urlIndexSortBy = urlToFilterItemIndex(sort, sortBy);

    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;

    // Set filters through service for other modules.
    setTimeout(() => {
      this.reloadComments();
    }, 0);
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
  'UrlService',
];

export default CommentsController;
