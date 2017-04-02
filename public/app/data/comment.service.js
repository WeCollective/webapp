import Injectable from 'utils/injectable';

class CommentService extends Injectable {
  constructor(...injections) {
    super(CommentService.$inject, injections);
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.API.save('/post/:postid/comments', {
        postid: data.postid
      }, data).then((response) => {
        // pass on the returned commentid
        resolve(response.data);
      }).catch((response) => { return reject(response.data || response); });
    });
  }

  // get the comments on a post or replies to another comment
  getMany(postid, parentid, sortBy, lastCommentId) {
    return new Promise((resolve, reject) => {
      let params = {
        parentid: parentid,
        sort: sortBy
      };
      if(lastCommentId) params.lastCommentId = lastCommentId;

      this.API.fetch('/post/:postid/comments', {
        postid: postid
      }, params).then((comments) => {
        resolve(comments.data);
      }).catch((response) => { return reject(response.data || response); });
    });
  }

  fetch(postid, commentid) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/post/:postid/comments/:commentid', {
        postid: postid,
        commentid: commentid
      }).then((comment) => {
        if(!comment || !comment.data) { return reject(); }
        resolve(comment.data);
      }).catch((response) => { return reject(response.data || response); });
    });
  }

  vote(postid, commentid, vote) {
    return new Promise((resolve, reject) => {
      if(vote !== 'up' && vote !== 'down') { return reject(); }

      this.API.update('/post/:postid/comments/:commentid', {
        postid: postid,
        commentid: commentid
      }, {
        vote: vote
      }, true)
      .then(resolve)
      .catch((response) => { return reject(response.data || response); });
    });
  }

  update(postid, commentid, text) {
    return new Promise((resolve, reject) => {
      this.API.update('/post/:postid/comments/:commentid', {
        postid: postid,
        commentid: commentid
      }, {
        text: text
      }, true)
      .then(resolve)
      .catch((response) => { return reject(response.data || response); });
    });
  }
}
CommentService.$inject = ['API'];

export default CommentService;
