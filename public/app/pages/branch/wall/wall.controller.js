import Injectable from 'utils/injectable';

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    this.isLoading = false;
    this.isLoadingMore = false;
    this.posts = [];
    this.stat = 'global';
    this.controls = {
      timeRange: {
        selectedIndex: 0,
        items: ['ALL TIME', 'PAST YEAR', 'PAST MONTH', 'PAST WEEK', 'PAST 24 HRS', 'PAST HOUR']
      },
      sortBy: {
        selectedIndex: 0,
        items: ['TOTAL POINTS', '# OF COMMENTS', 'DATE POSTED']
      },
      postType: {
        selectedIndex: 0,
        items: ['ALL', 'TEXT', 'IMAGES', 'VIDEOS', 'AUDIO', 'PAGES', 'POLLS']
      }
    };

    let init = () => {
      if(this.$state.current.name.indexOf('weco.branch.wall') === -1) return;
      if(Object.keys(this.BranchService.branch).length === 0) return;

      this.getPosts();
    };

    init();
    this.$scope.$watch(() => this.controls.timeRange.selectedIndex, () => { init(); });
    this.$scope.$watch(() => this.controls.postType.selectedIndex, () => { init(); });
    this.$scope.$watch(() => this.controls.sortBy.selectedIndex, () => { init(); });
    this.EventService.on(this.EventService.events.CHANGE_BRANCH, init);
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

  setStat(stat) {
    this.$timeout(() => {
      this.stat = stat;
      if(this.controls.sortBy.items[this.controls.sortBy.selectedIndex] === 'TOTAL POINTS') {
        this.isLoading = true;
        this.posts = [];
        this.getPosts();
      }
    });
  }

  // return the correct ui-sref string for when the specified post is clicked
  getLink(post) {
    if(post.type === 'text' || post.type === 'poll') {
      return this.$state.href('weco.branch.post', { postid: post.id });
    }
    return post.text;
  }

  getPosts(lastPostId) {
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

    // fetch the posts for this branch and timefilter
    this.BranchService.getPosts(this.BranchService.branch.id, timeafter, sortBy, this.stat, postType, lastPostId).then((posts) => {
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

  loadMore() {
    if(!this.isLoadingMore) {
      this.isLoadingMore = true;
      if(this.posts.length > 0) this.getPosts(this.posts[this.posts.length - 1].id);
    }
  }
}
BranchWallController.$inject = ['$timeout', '$state', '$scope', 'BranchService', 'AlertsService', 'ENV', 'EventService'];

export default BranchWallController;
