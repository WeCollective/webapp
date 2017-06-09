import Injectable from 'utils/injectable';

class CommentsController extends Injectable {
  constructor(...injections) {
    super(CommentsController.$inject, injections);

    this.isLoading = false;
    this.isLoadingMore = false;
    this.comments = [];
    this.controls = {
      sortBy: {
        selectedIndex: 0,
        items: ['POINTS', 'REPLIES', 'DATE']
      }
    };

    this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, (name) => {
      if(name !== 'CommentsScrollToBottom') return;
      if(!this.isLoadingMore) {
        this.isLoadingMore = true;
        if(this.comments.length > 0) this.getComments(this.comments[this.comments.length - 1].id);
      }
    });
    this.$rootScope.$watch(() => this.controls.sortBy.selectedIndex, () => { this.reloadComments(); });
    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, () => { this.reloadComments(); });
  }

  isCommentPermalink() {
    return this.$state.current.name === 'weco.branch.post.comment';
  }

  getComments(lastCommentId) {
    if(this.isCommentPermalink()) {
      // fetch the permalinked comment
      this.CommentService.fetch(this.$state.params.postid, this.$state.params.commentid).then((comment) => {
        this.$timeout(() => {
          this.comments = [comment];
          this.isLoading = false;
        });
      }).catch((err) => {
        if(err.status != 404) {
          this.AlertsService.push('error', 'Error loading comments.');
        }
        this.isLoading = false;
      });
    } else {
      // fetch all the comments for this post
      let sortBy = this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase();
      this.CommentService.getMany(this.$state.params.postid, undefined, sortBy, lastCommentId).then((comments) => {
        this.$timeout(() => {
          // if lastCommentId was specified we are fetching _more_ comments, so append them
          if(lastCommentId) {
            this.comments = this.comments.concat(comments);
          } else {
            this.comments = comments;
          }
          this.isLoadingMore = false;
          this.isLoading = false;
        });
      }).catch((err) => {
        if(err.status !== 404) {
          this.AlertsService.push('error', 'Error loading comments.');
        }
        this.isLoading = false;
      });
    }
  }

  reloadComments() {
    this.isLoading = true;
    this.comments = [];
    this.getComments();
  }
}
CommentsController.$inject = ['$timeout', '$rootScope', '$state', 'PostService', 'EventService', 'CommentService'];

export default CommentsController;
