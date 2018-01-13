import Injectable from 'utils/injectable';

class BranchPostController extends Injectable {
  constructor(...injections) {
    super(BranchPostController.$inject, injections);

    this.isLoading = true;

    // Possible states: show, maximise, hide.
    this.previewState = false;

    this.tabItems = [{
      label: 'vote',
      url: 'vote',
    }, {
      label: 'discussion',
      url: undefined,
    }, {
      label: 'results',
      url: 'results',
    }];
    this.labels = this.tabItems.map(x => x.label);
    this.urls = this.tabItems.map(x => x.url);

    this.tabStates = [
      'weco.branch.post.vote',
      ['weco.branch.post.discussion', 'weco.branch.post.comment'],
      'weco.branch.post.results',
    ];

    this.tabStateParams = [{
      branchid: this.BranchService.branch.id,
      postid: this.$state.params.postid,
    }, {
      branchid: this.BranchService.branch.id,
      postid: this.$state.params.postid,
    }, {
      branchid: this.BranchService.branch.id,
      postid: this.$state.params.postid,
    }];

    this.redirect = this.redirect.bind(this);

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.STATE_CHANGE_SUCCESS, this.redirect),
      this.EventService.on(events.CHANGE_POST, this.redirect),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  canPreviewPost() {
    const {
      text,
      type,
    } = this.PostService.post;

    if (['page', 'poll', 'text'].includes(type) && !text) {
      return false;
    }

    return true;
  }

  getPreviewTemplate() {
    return `/app/pages/branch/post/templates-preview/${this.PostService.post.type}.html`;
  }

  isPostType(type) {
    return this.PostService.post.type === type;
  }

  isYouTubeUrl() {
    const {
      text,
      url,
    } = this.PostService.post;

    // We need to support the old API where we used text for both description
    // and urls as the posts could have only one of the two.
    const str = url || text;

    if (!str) return '';

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
    const match = str.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0`;
    }

    return '';
  }

  redirect() {
    // post not updated yet, wait for CHANGE_POST event
    if (this.$state.params.postid !== this.PostService.post.id) {
      return;
    }

    const { post } = this.PostService;

    // update state params for tabs
    for (const i in this.tabStateParams) { // eslint-disable-line guard-for-in, no-restricted-syntax
      this.tabStateParams[i].branchid = post.branchid;
      this.tabStateParams[i].postid = post.id;
    }

    if (post.type === 'poll' && this.$state.current.name === 'weco.branch.post') {
      const tabIndex = this.urls.indexOf(this.$state.params.tab);

      if (tabIndex !== -1) {
        const state = Array.isArray(this.tabStates[tabIndex]) ?
          this.tabStates[tabIndex][0]
          : this.tabStates[tabIndex];

        this.$state.go(state, {
          branchid: post.branchid,
          postid: this.$state.params.postid,
        }, {
          location: 'replace',
        });
      }
      else {
        this.$state.go(this.tabStates[0], {
          branchid: post.branchid,
          postid: this.$state.params.postid,
        }, {
          location: 'replace',
        });
      }
    }
    else {
      this.isLoading = false;
    }
  }

  setPreviewState(state) {
    this.previewState = state;
  }

  toggleCinemaMode() {
    this.previewState = this.previewState === 'maximise' ? 'show' : 'maximise';
  }

  togglePreviewState() {
    // Needs ternary expression as there is also the 'maximise' state.
    this.previewState = this.previewState === 'hide' ? 'show' : 'hide';
  }
}

BranchPostController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$timeout',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'PostService',
  'UserService',
  'WallService',
];

export default BranchPostController;
