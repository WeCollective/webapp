import Injectable from 'utils/injectable';

class CommentService extends Injectable {
  constructor (...injections) {
    super(CommentService.$inject, injections);
  }

  create (data) {
    return new Promise((resolve, reject) => {
      this.API.save('/post/:postid/comments', { postid: data.postid }, data)
      // pass on the returned commentid
      .then(res => resolve(res.data))
      .catch(err => reject(err.data || err));
    });
  }

  fetch (postid, commentid) {
    return new Promise((resolve, reject) => {
      this.API.fetch('/post/:postid/comments/:commentid', { commentid, postid })
        .then(comment => {
          if (!comment || !comment.data) {
            return reject();
          }
          
          return resolve(comment.data);
        })
        .catch(err => reject(err.data || err));
    });
  }

  // get the comments on a post or replies to another comment
  getMany (postid, parentid, sort, lastCommentId) {
    return new Promise((resolve, reject) => {
      let params = { parentid, sort };
      
      if (lastCommentId) {
        params.lastCommentId = lastCommentId;
      }

      this.API.fetch('/post/:postid/comments', { postid }, params)
        .then(comments => resolve(comments.data))
        .catch(err => reject(err.data || err));
    });
  }

  update (postid, commentid, text) {
    return new Promise((resolve, reject) => {
      this.API.update('/post/:postid/comments/:commentid', { commentid, postid }, { text }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  vote (postid, commentid, vote) {
    return new Promise((resolve, reject) => {
      if (vote !== 'up' && vote !== 'down') {
        return reject();
      }

      this.API.update('/post/:postid/comments/:commentid', { commentid, postid }, { vote }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }
}

CommentService.$inject = [
  'API'
];

export default CommentService;
