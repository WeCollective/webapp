import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    this.controls = {
      postType: {
        items: [
          'all',
          'images',
          'videos',
          'audio',
          'text',
          'pages',
          'polls',
        ],
        selectedIndex: 0,
      },
      sortBy: {
        items: [
          'total points',
          '# of comments',
          'date posted',
        ],
        selectedIndex: 2,
      },
      statType: {
        items: [
          'global',
          'local',
          'branch',
        ],
        selectedIndex: 0,
      },
      timeRange: {
        items: [
          'all time',
          'past year',
          'past month',
          'past week',
          'past 24 hrs',
          'past hour',
        ],
        selectedIndex: 0,
      },
    };
    this.isLoading = false;
    // To stop sending requests once we hit the bottom of posts.
    this.lastFetchedPostId = false;
    this.posts = [];

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.callbackLoad = this.callbackLoad.bind(this);
    this.callbackScroll = this.callbackScroll.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.getPostType = this.getPostType.bind(this);
    this.getSortBy = this.getSortBy.bind(this);
    this.getStatType = this.getStatType.bind(this);
    this.getTimeAfter = this.getTimeAfter.bind(this);

    const listeners = [];
    listeners.push(this.$rootScope.$watch(() => this.controls.postType.selectedIndex, this.callbackDropdown));
    listeners.push(this.$rootScope.$watch(() => this.controls.sortBy.selectedIndex, this.callbackDropdown));
    listeners.push(this.$rootScope.$watch(() => this.controls.statType.selectedIndex, this.callbackDropdown));
    listeners.push(this.$rootScope.$watch(() => this.controls.timeRange.selectedIndex, this.callbackDropdown));
    listeners.push(this.EventService.on(this.EventService.events.CHANGE_BRANCH_PREFETCH, this.callbackLoad));
    listeners.push(this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, this.callbackScroll));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown(newValue, oldValue) {
    if (newValue !== oldValue) this.callbackLoad();
  }

  callbackLoad() {
    if (!this.$state.current.name.includes('weco.branch.wall')) return;
    this.getPosts();
  }

  callbackScroll(name) {
    if (name === 'WallScrollToBottom' && this.posts.length > 0) {
      this.getPosts(this.posts[this.posts.length - 1].id);
    }
  }

  // return the correct ui-sref string for when the specified post is clicked
  getLink(post) {
    if (post.type === 'text' || post.type === 'poll') {
      return this.$state.href('weco.branch.post', { postid: post.id });
    }

    return post.text;
  }

  getPosts(lastId) {
    let posts = this.posts;

    if (this.isLoading === true || lastId === this.lastFetchedPostId) {
      return;
    }

    this.isLoading = true;

    if (lastId) {
      this.lastFetchedPostId = lastId;
    }

    const id = this.BranchService.branch.id;
    const postType = this.getPostType();
    const sortBy = this.getSortBy();
    const statType = this.getStatType();
    const timeAfter = this.getTimeAfter();

    this.BranchService.getPosts(id, timeAfter, sortBy, statType, postType, lastId, false)
      .then(newPosts => this.$timeout(() => {
        // If lastId was specified, we are fetching more posts, so append them.
        posts = lastId ? posts.concat(newPosts) : newPosts;
        this.posts = posts;

        // 30 is the length of the posts response sent back by server.
        if (newPosts.length > 0 && newPosts.length < 30) {
          this.lastFetchedPostId = newPosts[newPosts.length - 1].id;
        }

        this.isLoading = false;
      }))
      .catch(() => {
        this.AlertsService.push('error', 'Error fetching posts.');
        this.isLoading = false;
      });
  }

  getPostType() {
    const key = this.controls.postType.items[this.controls.postType.selectedIndex];

    switch(key.toLowerCase()) {
      case 'images':
        return 'image';

      case 'videos':
        return 'video';

      case 'pages':
        return 'page';

      case 'polls':
        return 'poll';

      default:
        return key;
    }
  }

  getSortBy() {
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase()) {
      case 'total points':
        return 'points';

      case 'date posted':
        return 'date';

      case '# of comments':
        return 'comment_count';

      default:
        return 'points';
    }
  }

  getStatType() {
    const key = this.controls.statType.items[this.controls.statType.selectedIndex];

    switch(key.toLowerCase()) {
      case 'global':
        return 'global';
        
      case 'local':
        return 'local';

      case 'branch':
        return 'individual';

      default:
        return key;
    }
  }

  getTimeAfter() {
    switch(this.controls.timeRange.items[this.controls.timeRange.selectedIndex].toLowerCase()) {
      case 'past year':
        return new Date().setFullYear(new Date().getFullYear() - 1);

      case 'past month':
        return new Date().setMonth(new Date().getMonth() - 1);

      case 'past week':
        return new Date().setDate(new Date().getDate() - 7);

      case 'past 24 hrs':
        return new Date().setDate(new Date().getDate() - 1);

      case 'past hour':
        return new Date().setHours(new Date().getHours() - 1);

      case 'all time':
      default:
        return 0;
    }
  }
}

BranchWallController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'AppService',
  'BranchService',
  'EventService',
  'WallService',
];

export default BranchWallController;
