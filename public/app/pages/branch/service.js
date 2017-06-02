import Injectable from 'utils/injectable';

class WallService extends Injectable {
  constructor(...injections) {
    super(WallService.$inject, injections);

    this.isLoading = false;
    this.isLoadingMore = false;
    this.posts = [];
    this.flaggedOnly = false;
    this.controls = {
      timeRange: {
        selectedIndex: 0,
        items: ['ALL TIME', 'PAST YEAR', 'PAST MONTH', 'PAST WEEK', 'PAST 24 HRS', 'PAST HOUR']
      },
      sortBy: {
        selectedIndex: 2,
        items: ['TOTAL POINTS', '# OF COMMENTS', 'DATE POSTED']
      },
      postType: {
        selectedIndex: 0,
        items: ['ALL', 'TEXT', 'IMAGES', 'VIDEOS', 'AUDIO', 'PAGES', 'POLLS']
      },
      statType: {
        selectedIndex: 0,
        items: ['GLOBAL', 'LOCAL', 'BRANCH']
      }
    };

    this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, name => {
      if ('WallScrollToBottom' !== name) {
        return;
      }
      
      if (!this.isLoadingMore) {
        this.isLoadingMore = true;
        
        if (this.posts.length) {
          this.getPosts(this.posts[this.posts.length - 1].id);
        }
      }
    });
  }

  getPosts(lastPostId) {
    this.isLoading = true;

    const postType  = this.getPostType();
    const sortBy    = this.getSortBy();
    const statType  = this.getStatType();
    const timeafter = this.getTimeafter();

    // fetch the posts for this branch and timefilter
    this.BranchService.getPosts(this.BranchService.branch.id, timeafter, sortBy, statType, postType, lastPostId, this.flaggedOnly)
      .then( posts => {
        this.$timeout( () => {
          // If lastPostId was specified, we are fetching more posts, so append them.
          this.posts = lastPostId ? this.posts.concat(posts) : posts;
          this.isLoading = false;
          this.isLoadingMore = false;
        });
      })
      .catch( () => {
        this.AlertsService.push('error', 'Error fetching posts.');
        this.isLoading = false;
      });
  }

  getPostType() {
    switch(this.controls.postType.items[this.controls.postType.selectedIndex]) {
      case 'IMAGES':
        return 'image';

      case 'VIDEOS':
        return 'video';

      case 'PAGES':
        return 'page';

      case 'POLLS':
        return 'poll';

      default:
        return this.controls.postType.items[this.controls.postType.selectedIndex].toLowerCase();
    }
  }

  getSortBy() {
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex]) {
      case 'TOTAL POINTS':
        return 'points';

      case 'DATE POSTED':
        return 'date';

      case '# OF COMMENTS':
        return 'comment_count';

      default:
        return 'points';
    }
  }

  getStatType() {
    switch(this.controls.statType.items[this.controls.statType.selectedIndex]) {
      case 'GLOBAL':
        return 'global';
        
      case 'LOCAL':
        return 'local';

      case 'BRANCH':
        return 'individual';

      default:
        return this.controls.statType.items[this.controls.statType.selectedIndex].toLowerCase();
    }
  }

  // compute the appropriate timeafter for the selected time filter
  getTimeafter() {
    switch(this.controls.timeRange.items[this.controls.timeRange.selectedIndex]) {
      case 'PAST YEAR':
        return new Date().setFullYear(new Date().getFullYear() - 1);

      case 'PAST MONTH':
        return new Date().setMonth(new Date().getMonth() - 1);

      case 'PAST WEEK':
        return new Date().setDate(new Date().getDate() - 7);

      case 'PAST 24 HRS':
        return new Date().setDate(new Date().getDate() - 1);

      case 'PAST HOUR':
        return new Date().setHours(new Date().getHours() - 1);

      case 'ALL TIME':
      default:
        return 0;
    }
  }

  init(allowedState, flaggedOnly) {
    if (this.$state.current.name.indexOf(allowedState) === -1) {
      return;
    }

    if (!Object.keys(this.BranchService.branch).length) {
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