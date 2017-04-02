import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class PostService extends Injectable {
  constructor(...injections) {
    super(PostService.$inject, injections);
    this.post = {};

    let updatePost = () => {
      if(this.$state.current.name.indexOf('weco.branch.post') > -1) {
        this.fetch(this.$state.params.postid).then((post) => {
          this.post = post;
        })
        .catch((response) => {
          if(response.status === 404) {
            this.$state.go('weco.notfound');
          } else {
            this.AlertsService.push('error', 'Unable to fetch post.');
          }
        })
        .then(() => {
          this.EventService.emit(this.EventService.events.CHANGE_POST);
        })
        .then(this.$timeout);
      }
    };

    updatePost();
    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, updatePost);
  }

  getPictureUrl(id, thumbnail) {
    return this.API.fetch(`/post/:postid/picture${thumbnail ? '-thumb' : ''}`, {
      postid: id
    }, {});
  }

  fetch(postid) {
    return new Promise((resolve, reject) => {
      Generator.run(function* () {
        try {
          let response = yield this.API.fetch('/post/:postid', { postid: postid }, {});
          if(!response && !response.data) return reject();
          let post = response.data;

          try {
            response = yield this.API.fetch('/post/:postid/picture', { postid: postid }, {});
            post.profileUrl = response.data;
          } catch(e) { /* It's okay if we don't have any photos */ }

          try {
            response = yield this.API.fetch('/post/:postid/picture-thumb', { postid: postid }, {});
            post.profileUrlThumb = response.data;
          } catch(e) { /* It's okay if we don't have any photos */ }

          return resolve(post);
        } catch(response) { return reject(response.data || response); }
      }, this);
    });
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
      }, true)
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
PostService.$inject = ['API', '$timeout', '$state', 'AlertsService', 'EventService'];

export default PostService;
