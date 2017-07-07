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
    this.isLoadingMore = false;

    this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, name => {
      if (name !== 'CommentsScrollToBottom') return;

      if (!this.isLoadingMore) {
        this.isLoadingMore = true;

        if (this.comments.length > 0) {
          this.getComments(this.comments[this.comments.length - 1].id);
        }
      }
    });

    this.reloadComments = this.reloadComments.bind(this);

    this.$rootScope.$watch(() => this.controls.sortBy.selectedIndex, this.reloadComments);

    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, this.reloadComments);

    this.$scope.$on('$destroy', () => {
      console.log('oh nooo');
    });
  }

  getComments(lastCommentId) {
    if (this.isCommentPermalink()) {
      // fetch the permalinked comment
      this.CommentService.fetch(this.$state.params.postid, this.$state.params.commentid)
        .then(comment => {
          this.$timeout(() => {
            this.comments = [comment];
            this.isLoading = false;
          });
        })
        .catch(err => {
          if (err.status != 404) {
            this.AlertsService.push('error', 'Error loading comments.');
          }

          this.isLoading = false;
        });
    }
    else {
      // fetch all the comments for this post
      const sortBy = this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase();

      this.CommentService.getMany(this.$state.params.postid, undefined, sortBy, lastCommentId)
        .then(comments => {
          this.$timeout(() => {
            // if lastCommentId was specified we are fetching _more_ comments, so append them
            this.comments = lastCommentId ? this.comments.concat(comments) : comments;

            this.isLoading = false;
            this.isLoadingMore = false;
          });
        })
        .catch(err => {
          if (err.status !== 404) {
            this.AlertsService.push('error', 'Error loading comments.');
          }

          this.isLoading = false;
        });
    }
  }

  isCommentPermalink() {
    return this.$state.current.name === 'weco.branch.post.comment';
  }

  reloadComments() {
    this.isLoading = true;
    this.comments = [];
    this.getComments();
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
