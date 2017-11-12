import Injectable from 'utils/injectable';

class PostService extends Injectable {
  constructor(...injections) {
    super(PostService.$inject, injections);

    this.post = {};
    this.updating = false;

    this.updatePost = this.updatePost.bind(this);

    this.updatePost();

    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, this.updatePost);
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.API.post('/post', {}, data)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  createPollAnswer(postid, data) {
    return new Promise((resolve, reject) => {
      this.API.post('/poll/:postid/answer', { postid }, data)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  delete(postid) {
    return new Promise((resolve, reject) => {
      this.API.delete('/post/:postid', { postid })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  fetch(postid) {
    return new Promise((resolve, reject) => {
      this.API.get('/post/:postid', { postid }, {})
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  flag(postid, branchid, flag_type) { // eslint-disable-line camelcase
    return new Promise((resolve, reject) => {
      this.API.post('/post/:postid/flag', { postid }, { branchid, flag_type })
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }

  getPictureUrl(postid, thumbnail) {
    return this.API.get(`/post/:postid/picture${thumbnail ? '-thumb' : ''}`, { postid }, {});
  }

  getPollAnswers(postid, sortBy, lastAnswerId) {
    return new Promise((resolve, reject) => {
      this.API.get('/poll/:postid/answer', { postid }, { lastAnswerId, sortBy })
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  updatePost() {
    if (!this.$state.current.name.includes('weco.branch.post') || this.updating === true) {
      return;
    }

    this.updating = true;

    this.fetch(this.$state.params.postid)
      .then(post => {
        this.post = post;
        this.updating = false;
      })
      .catch(err => {
        this.updating = false;

        if (err.status === 404) {
          this.$state.go('weco.notfound');
        }
        else {
          this.AlertsService.push('error', 'Unable to fetch post.');
        }
      })
      .then(() => this.EventService.emit(this.EventService.events.CHANGE_POST))
      .then(this.$timeout);
  }

  vote(branchid, postid, vote) {
    return new Promise((resolve, reject) => {
      if (vote !== 'up' && vote !== 'down') {
        return reject();
      }

      return this.API.put('/branch/:branchid/posts/:postid', { branchid, postid }, { vote }, true)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  votePollAnswer(postid, answerid) {
    return new Promise((resolve, reject) => {
      this.API.put('/poll/:postid/answer/:answerid/vote', { answerid, postid }, { vote: 'up' }, true)
        .then(resolve)
        .catch(err => reject(err.data || err));
    });
  }
}

PostService.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'API',
  'BranchService',
  'EventService',
];

export default PostService;