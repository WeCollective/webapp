import Injectable from 'utils/injectable';

class CommentService extends Injectable {
  constructor(...injections) {
    super(CommentService.$inject, injections);
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.API.save('/post/:postid/comments', { postid: data.postid }, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err.data || err));
    });
  }

  delete(postid, commentid) {
    return new Promise((resolve, reject) => {
      this.API.delete('/post/:postid/comments/:commentid', { commentid, postid })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  fetch(postid, commentid) {
    return new Promise((resolve, reject) => {
      this.API.get('/post/:postid/comments/:commentid', { commentid, postid })
        .then(res => {
          if (!res || !res.data) {
            return reject();
          }
          
          return resolve(res.data);
        })
        .catch(err => reject(err.data || err));
    });
  }

  // get the comments on a post or replies to another comment
  getMany(postid, parentid, sort, lastCommentId) {
    return new Promise((resolve, reject) => {
      let params = {
        parentid,
        sort,
      };
      
      if (lastCommentId) {
        params.lastCommentId = lastCommentId;
      }

      this.API.get('/post/:postid/comments', { postid }, params)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  update(postid, commentid, text) {
    return new Promise((resolve, reject) => {
      this.API.update('/post/:postid/comments/:commentid', { commentid, postid }, { text }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  vote(postid, commentid, vote) {
    return new Promise((resolve, reject) => {
      if (vote !== 'up' && vote !== 'down') {
        return reject();
      }

      this.API.put('/post/:postid/comments/:commentid', { commentid, postid }, { vote }, true)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }
}

CommentService.$inject = [
  'API',
];

export default CommentService;
