import Injectable from 'utils/injectable';

class BranchPostController extends Injectable {
  constructor(...injections) {
    super(BranchPostController.$inject, injections);

    this.isLoadingPost = true;
    this.isLoadingComments = true;
    this.isLoadingMore = false;
    
    // Possible states: show, maximise.
    this.previewState = 'show';

    this.tabItems = [
      'vote',
      'results',
      'discussion'
    ];

    this.tabStates = [
      'weco.branch.post.vote',
      'weco.branch.post.results',
      'weco.branch.post.discussion'
    ];
    
    this.tabStateParams = [{
      branchid: this.BranchService.branch.id,
      postid: this.$state.params.postid
    }, {
      branchid: this.BranchService.branch.id,
      postid: this.$state.params.postid
    }, {
      branchid: this.BranchService.branch.id,
      postid: this.$state.params.postid
    }];

    let redirect = () => {
      // post not updated yet, wait for CHANGE_POST event
      if(this.$state.params.postid !== this.PostService.post.id) {
        return;
      }

      // update state params for tabs
      for (let i in this.tabStateParams) {
        this.tabStateParams[i].branchid = this.PostService.post.branchid;
        this.tabStateParams[i].postid = this.PostService.post.id;
      }

      if ('poll' === this.PostService.post.type && 'weco.branch.post' === this.$state.current.name) {
        const tabIndex = this.tabItems.indexOf(this.$state.params.tab || 'vote');

        if (tabIndex !== -1) {
          this.$state.go(this.tabStates[tabIndex], {
            branchid: this.PostService.post.branchid,
            postid: this.$state.params.postid
          }, {
            location: 'replace'
          });
        }
        else {
          console.log(`Invalid tab name!`);
        }
      }
      else {
        this.isLoadingPost = false;
      }
    };

    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, redirect);
    this.EventService.on(this.EventService.events.CHANGE_POST, redirect);
  }

  getPreviewTemplate() {
    return `/app/pages/branch/post/${this.PostService.post.type}.preview.template.html`;
  }

  getVideoEmbedUrl() {
    let isYouTubeUrl = url => {
      if (url && '' !== url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          return true;
        }
      }
      return false;
    };

    if ('video' === this.PostService.post.type && isYouTubeUrl(this.PostService.post.data.text)) {
      let video_id = this.PostService.post.data.text.split('v=')[1] || this.PostService.post.data.text.split('embed/')[1];
      
      if (video_id.indexOf('&') !== -1) {
        video_id = video_id.substring(0, video_id.indexOf('&'));
      }

      return `//www.youtube.com/embed/${video_id}?rel=0`;
    }

    return '';
  }

  isOwnPost() {
    if(!this.PostService.post || !this.PostService.post.data) return false;
    return this.UserService.user.username === this.PostService.post.data.creator;
  }

  openDeletePostModal() {
    this.ModalService.open(
      'DELETE_POST',
      {
        postid: this.PostService.post.id
      },
      'Post deleted.',
      'Unable to delete post.'
    );
    
    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if ('DELETE_POST' !== name) return;
      this.$state.go('weco.home');
    });
  }

  setPreviewState(state) {
    this.previewState = state;
  }

  shouldShowTabs() {
    return this.PostService.post.type === 'poll' && this.$state.current.name !== 'weco.branch.post.comment';
  }

  showPreview() {
    return ['image', 'text', 'video', 'poll'].indexOf(this.PostService.post.type) !== -1;
  }
}

BranchPostController.$inject = [
  '$rootScope',
  '$state',
  '$timeout',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'PostService',
  'UserService',
  'WallService'
];

export default BranchPostController;