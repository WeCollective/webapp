import Injectable from 'utils/injectable';

class BranchPostController extends Injectable {
  constructor(...injections) {
    super(BranchPostController.$inject, injections);

    this.isLoadingPost = true;
    this.isLoadingComments = true;
    this.isLoadingMore = false;
    this.previewState = 'show'; // other states: 'show', 'maximise'

    this.tabItems = ['vote', 'results', 'discussion'];
    this.tabStates = [
      `weco.branch.post.vote({ "branchid": "${this.branchid}", "postid": "${this.$state.params.postid}"})`,
      `weco.branch.post.results({ "branchid": "${this.branchid}", "postid": "${this.$state.params.postid}"})`,
      `weco.branch.post.discussion({ "branchid": "${this.branchid}", "postid": "${this.$state.params.postid}"})`
    ];
  }

  isOwnPost() {
    if(!this.PostService.post || !this.PostService.post.data) return false;
    return this.UserService.user.username == this.PostService.post.data.creator;
  }

  setPreviewState(state) {
    this.previewState = state;
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
    this.$state.go('weco.home');
  }

  getPreviewTemplate() {
    return `/app/pages/branch/post/${this.PostService.post.type}.preview.template.html`;
  }

  showPreview() {
    return ['image', 'text', 'video'].indexOf(this.PostService.post.type) > -1;
  }

  getVideoEmbedUrl() {
    let isYouTubeUrl = (url) => {
      if(url && url !== '') {
        let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        let match = url.match(regExp);
        if(match && match[2].length === 11) {
          return true;
        }
      }
      return false;
    };

    if(this.PostService.post.type === 'video' && isYouTubeUrl(this.PostService.post.data.text)) {
      let video_id = this.PostService.post.data.text.split('v=')[1] || this.PostService.post.data.text.split('embed/')[1];
      if(video_id.indexOf('&') !== -1) {
        video_id = video_id.substring(0, video_id.indexOf('&'));
      }
      return `//www.youtube.com/embed/${video_id}?rel=0`;
    }
    return '';
  }
}
BranchPostController.$inject = ['$timeout', '$rootScope', '$state', 'EventService', 'WallService', 'PostService', 'AppService'];

export default BranchPostController;
