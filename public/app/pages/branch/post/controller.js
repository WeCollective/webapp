import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
  PostTypeImage,
  PostTypePoll,
  PostTypeText,
  PostTypeVideo,
} = Constants;

class BranchPostController extends Injectable {
  constructor(...injections) {
    super(BranchPostController.$inject, injections);

    this.redirect = this.redirect.bind(this);

    this.PostTypeImage = PostTypeImage;
    this.PostTypePoll = PostTypePoll;
    this.PostTypeText = PostTypeText;
    this.PostTypeVideo = PostTypeVideo;
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
    this.tabStates = [
      'weco.branch.post.vote',
      ['weco.branch.post.discussion', 'weco.branch.post.comment'],
      'weco.branch.post.results',
    ];

    const { id: branchid } = this.BranchService.branch;
    const { postid } = this.$state.params;
    this.tabStateParams = [
      { branchid, postid },
      { branchid, postid },
      { branchid, postid },
    ];

    this.labels = this.tabItems.map(x => x.label);
    this.urls = this.tabItems.map(x => x.url);

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
      url,
    } = this.PostService.post;

    if (['poll', 'text'].includes(type) && !text) {
      return false;
    }

    if (type === 'page' && ((url && !text) || !url)) {
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
    const {
      postid,
      tab,
    } = this.$state.params;

    const {
      branchid,
      id,
    } = this.PostService.post;

    // Post not updated yet, wait for the CHANGE_POST event.
    if (postid !== id) return;

    // update state params for tabs
    for (const i in this.tabStateParams) { // eslint-disable-line guard-for-in, no-restricted-syntax
      this.tabStateParams[i].branchid = branchid;
      this.tabStateParams[i].postid = id;
    }

    if (this.isPostType(PostTypePoll) && this.$state.current.name === 'weco.branch.post') {
      const tabIndex = this.urls.indexOf(tab);
      let state = '';

      if (tabIndex !== -1) {
        state = Array.isArray(this.tabStates[tabIndex]) ?
          this.tabStates[tabIndex][0]
          : this.tabStates[tabIndex];
      }
      else {
        [state] = this.tabStates;
      }

      this.$state.go(state, { branchid, postid }, { location: 'replace' });
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
