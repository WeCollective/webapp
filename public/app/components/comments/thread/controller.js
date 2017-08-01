import Injectable from 'utils/injectable';

class CommentThreadController extends Injectable {
  constructor(...injections) {
    super(CommentThreadController.$inject, injections);

    this.parentComment = undefined; // the comment which is being replied to
  }

  closeReply() {
    this.$timeout(() => this.parentComment.meta = {
      openReply: false,
      update: false,
    });
  }

  commentPermalink(comment) {
    this.$state.go('weco.branch.post.comment', {
      commentid: comment.id,
      postid: comment.postid,
    }, {
      reload: true,
    });
  }

  delete(comment) {
    this.ModalService.open('DELETE_COMMENT', {
      commentid: comment.id,
      postid: comment.postid,
    },
      'Comment deleted.', 'Unable to delete comment.' );
  }

  isOwnComment(comment) {
    if (!this.UserService.user || !comment.data) {
      return false;
    }
    
    return this.UserService.user.username === comment.data.creator;
  }

  loadMore(comment) {
    let lastCommentId = null;
    if (comment.comments && comment.comments.length) {
      lastCommentId = comment.comments[comment.comments.length - 1].id;
    }

    // fetch the replies to this comment, or just the number of replies
    this.CommentService.getMany(comment.postid, comment.id, this.sortBy.toLowerCase(), lastCommentId)
      .then(comments => this.$timeout(() => {
        // if lastCommentId was specified we are fetching _more_ comments, so append them
        comment.comments = lastCommentId ? comment.comments.concat(comments) : comments;
      }))
      .catch(() => this.AlertsService.push('error', 'Unable to get replies!'));
  }

  onSubmitComment() {
    // The comment was edited...
    if (this.parentComment.meta.update) {
      // Reload the comment data.
      this.CommentService.fetch(this.parentComment.postid, this.parentComment.id)
        .then(response => this.$timeout(() => {
          // Copy keys to avoid destroying 'parentComment' object reference to 'comment' in the comments array.
          for (let key in response) {
            this.parentComment[key] = response[key];
          }

          this.closeReply();
        }))
        .catch(() => {
          this.AlertsService.push('error', 'Unable to reload comment!');
          this.closeReply();
        });
    }
    // The comment was replied to...
    else {
      // Load the replies.
      this.loadMore(this.parentComment);
      this.closeReply();
    }
  }

  openReply(comment, isEdit) {
    this.$timeout(() => {
      if (this.parentComment && this.parentComment.meta) {
        this.parentComment.meta.openReply = false;
      }

      this.parentComment = comment;
      this.parentComment.meta = {
        openReply: true,
        update: isEdit,
      };
    });
  }

  timeSince(date) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
    const elapsed = new Date().getTime() - new Date(date);

    if (elapsed < msPerMinute) {
      return `${Math.round(elapsed / 1000)} seconds ago`;
    }

    if (elapsed < msPerHour) {
      const int = Math.round(elapsed / msPerMinute);
      return `${int} minute${int !== 1 ? 's' : ''} ago`;
    }

    if (elapsed < msPerDay ) {
      const int = Math.round(elapsed / msPerHour);
      return `${int} hour${int !== 1 ? 's' : ''} ago`;
    }

    if (elapsed < msPerMonth) {
      const int = Math.round(elapsed / msPerDay);
      return `${int} day${int !== 1 ? 's' : ''} ago`;
    }

    if (elapsed < msPerYear) {
      const int = Math.round(elapsed / msPerMonth);
      return `${int} month${int !== 1 ? 's' : ''} ago`;
    }

    const int = Math.round(elapsed / msPerYear);
    return `${int} year${int !== 1 ? 's' : ''} ago`;
  }

  vote(comment, direction, iconNode) {
    this.CommentService.vote(comment.postid, comment.id, direction)
      .then(res => this.$timeout(() => {
        const delta = res.delta || 0;

        comment.votes.individual += delta;

        if (comment.votes.userVoted) {
          delete comment.votes.userVoted;
        }
        else {
          comment.votes.userVoted = direction;
        }

        if (iconNode) {
          if (direction === 'up') {
            if (delta > 0) {
              iconNode.classList.add('style--active');
            }
            else {
              iconNode.classList.remove('style--active');
            }
          }
        }
      }))
      .catch(err => {
        if (err.status === 400) {
          this.AlertsService.push('error', 'Invalid request - there was an issue on our side!');
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
  'EventService',
  'ModalService',
  'UserService',
];

export default CommentThreadController;
