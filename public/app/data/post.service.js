import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class PostService extends Injectable {
  constructor(...injections) {
    super(PostService.$inject, injections);
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.API.save('/post', {}, data).then((response) => {
        // pass on the returned postid
        resolve(response.data);
      }).catch((response) => { return reject(response.data || response); });
    });
  }

  vote(branchid, postid, vote) {
    return new Promise((resolve, reject) => {
      if(vote !== 'up' && vote !== 'down') { return reject(); }

      this.API.update('/branch/:branchid/posts/:postid', {
        branchid: branchid,
        postid: postid
      }, {
        vote: vote
      })
      .then(resolve)
      .catch((response) => { return reject(response.data || response); });
    });
  }

  flag(postid, branchid, flag_type) {
    return new Promise((resolve, reject) => {
      this.API.save('/post/:postid/flag', {
        postid: postid
      }, {
        flag_type: flag_type,
        branchid: branchid
      })
      .then(resolve)
      .catch((response) => { return reject(response.data || response); });
    });
  }
}
PostService.$inject = ['API'];

export default PostService;
