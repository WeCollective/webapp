import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
  PostTypePoll,
  PostTypeText,
} = Constants;

class BranchWallController extends Injectable {
  constructor(...injections) {
    super(BranchWallController.$inject, injections);

    this.callbackScroll = this.callbackScroll.bind(this);
    this.getItems = this.getItems.bind(this);

    this.isInit = true;
    this.isWaitingForRequest = false;

    this.PostService.posts = [];

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.CHANGE_BRANCH_PREFETCH, () => this.getItems()),
      this.EventService.on(events.CHANGE_FILTER, () => this.getItems()),
      this.EventService.on(events.SCROLLED_TO_BOTTOM, this.callbackScroll),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackScroll() {
    const { posts } = this.PostService;
    if (posts.length) {
      this.getItems(posts[posts.length - 1].id);
    }
  }

  getItems(lastPostId) {
    if (this.isWaitingForRequest || !this.$state.current.name.includes('weco.branch.wall')) {
      return;
    }

    const { branchid } = this.$state.params;

    this.isWaitingForRequest = true;
    this.PostService.getPosts(branchid, lastPostId, false)
      .then(() => this.$timeout(() => {
        this.isInit = false;
        this.isWaitingForRequest = false;
      }))
      .catch(() => this.$timeout(() => {
        this.AlertsService.push('error', 'Error fetching posts.');
        this.isInit = false;
        this.isWaitingForRequest = false;
      }));
  }

  // Return the correct ui-sref string.
  getLink(post) {
    const correctUiSrefForTypes = [
      PostTypePoll,
      PostTypeText,
    ];

    if (correctUiSrefForTypes.includes(post.type)) {
      return this.$state.href('weco.branch.post', { postid: post.id });
    }

    return post.text;
  }

  getStatType() {
    return this.HeaderService.getFilters().statType;
  }
}

BranchWallController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'BranchService',
  'EventService',
  'HeaderService',
  'PostService',
];

export default BranchWallController;
