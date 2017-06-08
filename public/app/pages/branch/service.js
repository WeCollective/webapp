import Injectable from 'utils/injectable';

class WallService extends Injectable {
  constructor(...injections) {
    super(WallService.$inject, injections);

    this.controls = {
      postType: {
        items: [
          'all',
          'text',
          'images',
          'videos',
          'audio',
          'pages',
          'polls'
        ],
        selectedIndex: 0
      },
      sortBy: {
        items: [
          'total points',
          '# of comments',
          'date posted'
        ],
        selectedIndex: 2
      },
      statType: {
        items: [
          'global',
          'local',
          'branch'
        ],
        selectedIndex: 0
      },
      timeRange: {
        items: [
          'all time',
          'past year',
          'past month',
          'past week',
          'past 24 hrs',
          'past hour'
        ],
        selectedIndex: 0
      }
    };
    this.flaggedOnly = false;
    this.isLoading = false;
    this.isLoadingMore = false;
    this.posts = [];

    this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, name => {
      if ('WallScrollToBottom' !== name) return;
      
      if (!this.isLoadingMore) {
        this.isLoadingMore = true;
        
        if (this.posts.length) {
          this.getPosts(this.posts[this.posts.length - 1].id);
        }
      }
    });
  }

  getPosts(lastPostId) {
    if (this.isLoading === true) return;

    // We are fetching a new set of posts, hide the cached ones.
    if (!lastPostId) {
      this.posts = [];
    }

    this.isLoading = true;

    const postType  = this.getPostType();
    const sortBy    = this.getSortBy();
    const statType  = this.getStatType();
    const timeafter = this.getTimeafter();

    // fetch the posts for this branch and timefilter
    this.BranchService.getPosts(this.BranchService.branch.id, timeafter, sortBy, statType, postType, lastPostId, this.flaggedOnly)
      .then( posts => {
        this.$timeout( _ => {
          // If lastPostId was specified, we are fetching more posts, so append them.
          this.posts = lastPostId ? this.posts.concat(posts) : posts;
          this.isLoading = false;
          this.isLoadingMore = false;
        });
      })
      .catch( _ => {
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

  // compute the appropriate timeafter for the selected time filter
  getTimeafter() {
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

  // This is also called from `/wall` and `/nucleus` controllers.
  init(allowedState, flaggedOnly) {
    if (!this.$state.current.name.includes(allowedState) || !Object.keys(this.BranchService.branch).length) {
      return;
    }

    this.flaggedOnly = !!flaggedOnly;
    
    if (this.flaggedOnly) {
      this.controls.sortBy.selectedIndex = 2;
    }

    this.getPosts();
  }
}

WallService.$inject = [
  '$rootScope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService'
];

export default WallService;