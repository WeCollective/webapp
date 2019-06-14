import Injectable from 'utils/injectable';

class PostService extends Injectable {
  constructor(...injections) {
    super(PostService.$inject, injections);

    this.updatePost = this.updatePost.bind(this);

    this.lastRequest = null;
    this.post = {};
    this.posts = [];
    this.updating = false;

    this.resetLastRequest();
    this.updatePost();

	this.lastIdToPass = null;
	this.lastFiltered = null;
    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, this.updatePost);
  }

  create(data) {
    return new Promise((resolve, reject) => this.API
      .post('/post', {}, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err.data || err)));
  }

  createPollAnswer(postid, data) {
    return new Promise((resolve, reject) => this.API
      .post('/poll/:postid/answer', { postid }, data)
      .then(resolve)
      .catch(err => reject(err.data || err)));
  }

  delete(postid) {
    return new Promise((resolve, reject) => this.API
      .delete('/post/:postid', { postid })
      .then(resolve)
      .catch(err => reject(err.data || err)));
  }

  fetch(postid, branchid) {
    return new Promise((resolve, reject) => this.API
      .get('/post/:postid', { postid }, { branchid })
      .then(res => resolve(res.data))
      .catch(err => reject(err.data || err)));
  }

  flag(postid, branchid, flag_type) { // eslint-disable-line camelcase
    return new Promise((resolve, reject) => this.API
      .post('/post/:postid/flag', { postid }, { branchid, flag_type })
      .then(resolve)
      .catch(err => reject(err.data || err)));
  }

  getLinkMetaData(url) {
    return new Promise((resolve, reject) => this.API
      .get('/scraper', null, { url })
      .then(res => resolve(res.data))
      .catch(err => reject(err.data || err)));
  }

  getPictureUrl(postid, thumbnail) {
    return this.API.get(`/post/:postid/picture${thumbnail ? '-thumb' : ''}`, { postid }, {});
  }

  getPollAnswers(postid, sortBy, lastAnswerId) {
    return new Promise((resolve, reject) => this.API
      .get('/poll/:postid/answer', { postid }, { lastAnswerId, sortBy })
      .then(res => resolve(res.data))
      .catch(err => reject(err.data || err)));
  }

  getPosts(branchid, lastId, flag) {
    const filters = this.HeaderService.getFilters();
    const lr = this.lastRequest;
    const {
      postType,
      sortBy,
      statType,
      timeRange,
	  query,
    } = filters;

    // Don't send the request if the filters aren't initialised properly yet.
    if (postType === null || postType === undefined || sortBy === null ||
      sortBy === undefined || statType === null || statType === undefined ||
      timeRange === null || timeRange === undefined || query === undefined) {
      return Promise.resolve();
    }

    // Don't send the request if nothing changed.
	//TODO: if filters are the same but query has changed just filter current data
    if (lr.id === branchid && lr.lastId === lastId &&
      lr.postType === postType && lr.sortBy === sortBy &&
      lr.statType === statType && lr.timeRange === timeRange && lr.query===query) {
      return Promise.resolve();
    }

    const branchChanged = lr.id !== branchid;

    // Update the last request values to compare with the next call.
    this.lastRequest.id = branchid;
    this.lastRequest.lastId = lastId;
    this.lastRequest.postType = postType;
    this.lastRequest.sortBy = sortBy;
    this.lastRequest.statType = statType;
    this.lastRequest.timeRange = timeRange;
	this.lastRequest.query = query;

    const params = {
      flag: !!flag,
      postType,
      sortBy,
      stat: statType,
      timeafter: timeRange,
	  query:query,
    };

    if (lastId) {
		params.lastPostId = this.lastIdToPass;
		if(!!this.lastFiltered)
			params.lastFiltered = this.lastFiltered;
	}
	

	
    return this.API.get('/branch/:branchid/posts', { branchid }, params)
      .then(res => {
        const newPosts = res.data;
		//case when searching post:
			//case actual results are 0 newPosts = [] 
			//case actual results are n newPosts = [n] and newPosts[last] = the final search post, take it out and use it in later requests
			//case results are 30 and lastfilterid exists, next time pagnating and have to attach lastFiltered with the id of lastfilterid
			//err case when queryIsOk is false on the API side - make sure that queryIsOk returns false only when filtering without a search
			//otherwise fail first here and don't send the request, make the checks on the client-side checkout branchwallposts controller get function queryIsOk variable
		//case when not searching post:
			//case results are normal and post at the end
			
		if(newPosts.length>0) {
			let temp = newPosts.splice(newPosts.length-1,1);
			this.lastIdToPass = temp[0].id;
			if(!!temp[0].lastfilterid){
				this.lastFiltered = temp[0].lastfilterid;
			}
			else
				this.lastFiltered = null;
		}
		
        if (lastId && !branchChanged) {
          this.posts = [
            ...this.posts,
            ...newPosts,
          ];
        }
        else {
          this.posts = [...newPosts];
        }

        this.EventService.emit(this.EventService.events.POSTS_LOADED);
        // todo extract constants into a separate file
        const reachedBottom = newPosts.lengtht < 30;
        return Promise.resolve(reachedBottom);
      })
      .catch(err => Promise.reject(err.data || err));
  }

  resetLastRequest() {
    this.lastRequest = {
      id: undefined,
      lastId: undefined,
      postType: undefined,
      sortBy: undefined,
      statType: undefined,
      timeRange: undefined,
	  query: undefined,
    };
	this.lastIdToPass = null;
	this.lastFiltered = null;
  }

  updatePost() {
    if (!this.$state.current.name.includes('weco.branch.post') || this.updating === true) {
      return;
    }

    const {
      branchid,
      postid,
    } = this.$state.params;

    this.updating = true;

    this.fetch(postid, branchid)
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
      if (!['up', 'down'].includes(vote)) {
        return reject();
      }

      return this.API.put('/branch/:branchid/posts/:postid', { branchid, postid }, { vote }, true)
        .then(res => resolve(res.data))
        .catch(err => reject(err.data || err));
    });
  }

  votePollAnswer(postid, answerid) {
    return new Promise((resolve, reject) => this.API
      .put('/poll/:postid/answer/:answerid/vote', { answerid, postid }, { vote: 'up' }, true)
      .then(resolve)
      .catch(err => reject(err.data || err)));
  }
}

PostService.$inject = [
  '$state',
  '$timeout',
  'AlertsService',
  'API',
  'BranchService',
  'EventService',
  'HeaderService',
];

export default PostService;