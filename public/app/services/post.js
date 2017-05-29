import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class PostService extends Injectable {
  constructor (...injections) {
    super(PostService.$inject, injections);
    this.post = {};

    const updatePost = () => {
      if (this.$state.current.name.indexOf('weco.branch.post') !== -1) {
        this.fetch(this.$state.params.postid)
          .then( post => {
            this.post = post;
          })
          .catch( err => {
            if (err.status === 404) {
              this.$state.go('weco.notfound');
            }
            else {
              this.AlertsService.push('error', 'Unable to fetch post.');
            }
          })
          .then( () => {
            this.EventService.emit(this.EventService.events.CHANGE_POST);
          })
          .then(this.$timeout);
      }
    };

    updatePost();

    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, updatePost);
  }

  create (data) {
    return new Promise( (resolve, reject) => {
      this.API.save('/post', {}, data)
        // pass on the returned postid
        .then( res => resolve(res.data) )
        .catch( err => reject(err.data || err) );
    });
  }

  createPollAnswer (postid, data) {
    return new Promise( (resolve, reject) => {
      this.API.save('/poll/:postid/answer', { postid }, data)
        .then(resolve)
        .catch( err => reject(err.data || err) );
    });
  }

  delete (postid) {
    return new Promise( (resolve, reject) => {
      this.API.remove('/post/:postid', { postid })
        .then(resolve)
        .catch( err => reject(err.data || err) );
    });
  }

  fetch (postid) {
    return new Promise( (resolve, reject) => {
      Generator.run(function* () {
        try {
          let res = yield this.API.fetch('/post/:postid', { postid }, {});
          
          if (!res && !res.data) {
            return reject();
          }
          
          let post = res.data;

          try {
            res = yield this.API.fetch('/post/:postid/picture', { postid }, {});
            post.profileUrl = res.data;
          }
          catch (e) { /* It's okay if we don't have any photos */ }

          try {
            res = yield this.API.fetch('/post/:postid/picture-thumb', { postid }, {});
            post.profileUrlThumb = res.data;
          }
          catch (e) { /* It's okay if we don't have any photos */ }

          return resolve(post);
        }
        catch (err) { return reject(err.data || err); }
      }, this);
    });
  }

  flag (postid, branchid, flag_type) {
    return new Promise( (resolve, reject) => {
      this.API.save('/post/:postid/flag', { postid }, { branchid, flag_type })
        .then(resolve)
        .catch( err => reject(err.data || err) );
    });
  }

  getPictureUrl (postid, thumbnail) {
    return this.API.fetch(`/post/:postid/picture${thumbnail ? '-thumb' : ''}`, { postid }, {});
  }

  getPollAnswers (postid, sortBy, lastAnswerId) {
    return new Promise( (resolve, reject) => {
      this.API.fetch('/poll/:postid/answer', { postid }, { lastAnswerId, sortBy })
        .then( res => resolve(res.data) )
        .catch( err => reject(err.data || err) );
    });
  }

  vote (branchid, postid, vote) {
    return new Promise( (resolve, reject) => {
      if (vote !== 'up' && vote !== 'down') {
        return reject();
      }

      this.API.update('/branch/:branchid/posts/:postid', { branchid, postid }, { vote }, true)
        .then(resolve)
        .catch( err => reject(err.data || err) );
    });
  }

  votePollAnswer (postid, answerid) {
    return new Promise( (resolve, reject) => {
      this.API.update('/poll/:postid/answer/:answerid/vote', { answerid, postid }, { vote: 'up' }, true)
        .then(resolve)
        .catch( err => reject(err.data || err) );
    });
  }
}

PostService.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'API',
  'BranchService',
  'EventService'
];

export default PostService;