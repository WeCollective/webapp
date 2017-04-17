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

    this.EventService.on(this.EventService.events.SCROLLED_TO_BOTTOM, (name) => {
      if(name !== 'WallScrollToBottom') return;
      if(!this.isLoadingMore) {
        this.isLoadingMore = true;
        if(this.posts.length > 0) this.getPosts(this.posts[this.posts.length - 1].id);
      }
    });
  }

  init(allowedState, flaggedOnly) {
    if(this.$state.current.name.indexOf(allowedState) === -1) return;
    if(Object.keys(this.BranchService.branch).length === 0) return;

    this.flaggedOnly = !!flaggedOnly;
    if(this.flaggedOnly) this.controls.sortBy.selectedIndex = 2;
    this.getPosts();
  }

  // compute the appropriate timeafter for the selected time filter
  getTimeafter(timeItem) {
    let timeafter;
    let date = new Date();
    switch(timeItem) {
      case 'ALL TIME':
        timeafter = 0;
        break;
      case 'PAST YEAR':
        timeafter = new Date().setFullYear(new Date().getFullYear() - 1);
        break;
      case 'PAST MONTH':
        timeafter = new Date().setMonth(new Date().getMonth() - 1);
        break;
      case 'PAST WEEK':
        timeafter = new Date().setDate(new Date().getDate() - 7);
        break;
      case 'PAST 24 HRS':
        timeafter = new Date().setDate(new Date().getDate() - 1);
        break;
      case 'PAST HOUR':
        timeafter = new Date().setHours(new Date().getHours() - 1);
        break;
      default:
        timeafter = 0;
        break;
    }
    return timeafter;
  }

  getStatType() {
    let statType;
    switch(this.controls.statType.items[this.controls.statType.selectedIndex]) {
      case 'GLOBAL':
        statType = 'global';
        break;
      case 'LOCAL':
        statType = 'local';
        break;
      case 'BRANCH':
        statType = 'individual';
        break;
      default:
        statType = this.controls.statType.items[this.controls.statType.selectedIndex].toLowerCase();
        break;
    }
    return statType;
  }

  getPosts(lastPostId) {
    this.isLoading = true;
    // compute the appropriate timeafter for the selected time filter
    let timeafter = this.getTimeafter(this.controls.timeRange.items[this.controls.timeRange.selectedIndex]);
    let sortBy;
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex]) {
      case 'TOTAL POINTS':
        sortBy = 'points';
        break;
      case 'DATE POSTED':
        sortBy = 'date';
        break;
      case '# OF COMMENTS':
        sortBy = 'comment_count';
        break;
      default:
        sortBy = 'points';
        break;
    }

    let postType;
    switch(this.controls.postType.items[this.controls.postType.selectedIndex]) {
      case 'IMAGES':
        postType = 'image';
        break;
      case 'VIDEOS':
        postType = 'video';
        break;
      case 'PAGES':
        postType = 'page';
        break;
      case 'POLLS':
        postType = 'poll';
        break;
      default:
        postType = this.controls.postType.items[this.controls.postType.selectedIndex].toLowerCase();
        break;
    }

    let statType = this.getStatType();

    // fetch the posts for this branch and timefilter
    this.BranchService.getPosts(this.BranchService.branch.id, timeafter, sortBy, statType, postType, lastPostId, this.flaggedOnly).then((posts) => {
      this.$timeout(() => {
        // if lastPostId was specified we are fetching _more_ posts, so append them
        if(lastPostId) {
          this.posts = this.posts.concat(posts);
        } else {
          this.posts = posts;
        }
        this.isLoading = false;
        this.isLoadingMore = false;
      });
    }).catch(() => {
      this.AlertsService.push('error', 'Error fetching posts.');
      this.isLoading = false;
    });
  }
}
WallService.$inject = ['$state', '$rootScope', '$timeout', 'BranchService', 'AlertsService', 'EventService'];

export default WallService;
