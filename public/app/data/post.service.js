import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class PostService extends Injectable {
  constructor(...injections) {
    super(PostService.$inject, injections);
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
}
PostService.$inject = ['API'];

export default PostService;
