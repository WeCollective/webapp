import Injectable from 'utils/injectable';

class CommentThreadController extends Injectable {
  constructor (...injections) {
    super(CommentThreadController.$inject, injections);

    this.openComment = undefined; // the comment which is being replied to
  }

  closeReply () {
    this.$timeout(_ => this.openComment.meta = {
      openReply: false,
      update: false
    });
  }

  // todo delete the comment
  delete () {
    //..
  }

  isOwnComment (comment) {
    if (!this.UserService.user || !comment.data) {
      return false;
    }
    
    return this.UserService.user.username === comment.data.creator;
  }

  loadMore (comment) {
    let lastCommentId = null;
    if (comment.comments && comment.comments.length) {
      lastCommentId = comment.comments[comment.comments.length - 1].id;
    }

    // fetch the replies to this comment, or just the number of replies
    this.CommentService.getMany(comment.postid, comment.id, this.sortBy.toLowerCase(), lastCommentId)
      .then(comments => {
        this.$timeout(_ => {
          // if lastCommentId was specified we are fetching _more_ comments, so append them
          comment.comments = lastCommentId ? comment.comments.concat(comments) : comments;
        });
      })
      .catch(_ => this.AlertsService.push('error', 'Unable to get replies!'));
  }

  // Params: comment
  onSubmitComment () {
    if (this.openComment.meta.update) { // if the comment was edited
      // reload the comment data
      this.CommentService.fetch(this.openComment.postid, this.openComment.id)
        .then(response => {
          this.$timeout(_ => {
            // copy keys over so not to destroy 'openComment' object reference to 'comment' in the comments array
            for (let key in response) {
              this.openComment[key] = response[key];
            }

            this.closeReply();
          });
        })
        .catch(_ => {
          this.AlertsService.push('error', 'Unable to reload comment!');
          this.closeReply();
        });
    }
    else {  // if the comment was replied to
      // load the replies
      this.loadMore(this.openComment);
      this.closeReply();
    }
  }

  openCommentPermalink (comment) {
    this.$state.go('weco.branch.post.comment', { postid: comment.postid, commentid: comment.id }, { reload: true });
  }

  openReply (comment, isEdit) {
    this.$timeout(_ => {
      if (this.openComment && this.openComment.meta) {
        this.openComment.meta.openReply = false;
      }

      this.openComment = comment;
      this.openComment.meta = {
        openReply: true,
        update: isEdit
      };
    });
  }

  timeSince (date) {
    const msPerMinute = 60 * 1000;
    const msPerHour   = msPerMinute * 60;
    const msPerDay    = msPerHour * 24;
    const msPerMonth  = msPerDay * 30;
    const msPerYear   = msPerDay * 365;

    const elapsed = new Date().getTime() - new Date(date);

    if (elapsed < msPerMinute) {
      return `${Math.round(elapsed / 1000)} seconds ago`;
    }
    if (elapsed < msPerHour) {
      return `${Math.round(elapsed / msPerMinute)} minutes ago`;
    }
    if (elapsed < msPerDay ) {
      return `${Math.round(elapsed / msPerHour)} hours ago`;
    }
    if (elapsed < msPerMonth) {
      return `${Math.round(elapsed / msPerDay)} days ago`;
    }
    if (elapsed < msPerYear) {
      return `${Math.round(elapsed / msPerMonth)} months ago`;
    }
    return `${Math.round(elapsed / msPerYear)} years ago`;
  }

  vote (comment, direction) {
    this.CommentService.vote(comment.postid, comment.id, direction)
      .then(_ => {
        const inc = (direction === 'up') ? 1 : -1;
        this.$timeout(_ => comment.individual += inc);
        this.AlertsService.push('success', 'Thanks for voting!');
      })
      .catch(err => {
        if (err.status === 400) {
          this.AlertsService.push('error', 'You have already voted on this comment.');
        }
        else if (err.status === 403) {
          this.AlertsService.push('error', 'Please log in or create an account to vote.');
        }
        else {
          this.AlertsService.push('error', 'Error voting on comment.');
        }
      });
  }
}

CommentThreadController.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'CommentService',
  'UserService',
];

export default CommentThreadController;
