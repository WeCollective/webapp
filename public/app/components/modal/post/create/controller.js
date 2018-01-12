import Constants from 'config/constants';
import Generator from 'utils/generator';
import Injectable from 'utils/injectable';

const { PostTypes } = Constants.AllowedValues;

class CreatePostModalController extends Injectable {
  constructor(...injections) {
    super(CreatePostModalController.$inject, injections);

    this.handleModalCancel = this.handleModalCancel.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);

    this.errorMessage = '';
    this.file = null;
    this.isLoading = false;
    this.newPost = {
      branchids: [],
      captcha: '',
      locked: false,
      nsfw: false,
      text: null,
      url: null,
    };
    this.pollAnswers = [];
    this.postType = {
      items: PostTypes,
      selectedIndex: 0,
    };
    this.preview = false;

    const parentBranch = this.ModalService.inputArgs.branchid;
    if (parentBranch !== 'root') {
      this.newPost.branchids = [
        ...this.newPost.branchids,
        {
          isRemovable: false,
          label: parentBranch,
        },
      ];
    }

    this.tags = this.newPost.branchids;
    this.url = '';

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.MODAL_CANCEL, this.handleModalCancel),
      this.EventService.on(events.MODAL_OK, this.handleModalSubmit),
    ];
    /*
    listeners.push(this.$scope.$watch(() => this.newPost.text, url => {
      if (!url || ['text', 'poll'].includes(this.postType.items[this.postType.selectedIndex])) {
        return;
      }

      const test = new RegExp('^(http|https|ftp)?(://)?(www|ftp)?.?[a-z0-9-]+(.|:)([a-z0-9-]+)+([/?].*)?$');
      const matches = url.match(test);

      if (matches) {
        const match = matches[0];
        this.PostService.getPictureUrlFromWebsiteUrl(match)
          .then(src => {
            this.url = src;
          })
          .catch(err => {
            if (err.status !== 400) {
              this.AlertsService.push('error', err);
            }
          });
      }
    }));
    */
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  flattenTagsArray(array) {
    if (!array.length || typeof array[0] !== 'object') return array;
    return array.map(item => item.label);
  }

  getUploadUrl(postid) {
    return new Promise((resolve, reject) => {
      const uploadUrlRoute = `post/${postid}/picture`;
      this.UploadService.fetchUploadUrl(uploadUrlRoute)
        .then(resolve)
        .catch(reject);
    });
  }

  handleModalCancel(name) {
    if (name !== 'CREATE_POST') return;

    this.$timeout(() => {
      this.errorMessage = '';
      this.isLoading = false;
      this.ModalService.Cancel();
    });
  }

  handleModalSubmit(name) {
    if (name !== 'CREATE_POST') return;

    this.newPost.type = this.postType.items[this.postType.selectedIndex].toLowerCase();

    const {
      branchids,
      text,
      title,
      type,
      url,
    } = this.newPost;

    // If not all fields are filled, display error.
    if (!this.newPost || !title || (this.BranchService.branch.id !== 'root' && !branchids) ||
      (!['poll', 'text'].includes(type) && !url) || (type === 'text' && !text)) {
      this.$timeout(() => this.errorMessage = 'Please fill in all fields.');
      return;
    }

    if (title.length > 200) {
      this.$timeout(() => this.errorMessage = 'Title cannot be more than 200 characters long.');
      return;
    }

    // Perform the update.
    this.isLoading = true;

    // create copy of post to not interfere with binding of items on tag-editor
    const post = JSON.parse(JSON.stringify(this.newPost)); // JSON parsing facilitates shallow copy
    post.branchids = JSON.stringify(this.flattenTagsArray(branchids));

    Generator.run(function* () { // eslint-disable-line func-names
      let postid;
      try {
        postid = yield this.PostService.create(post);
      }
      catch (err) {
        this.$timeout(() => {
          this.errorMessage = err.message || 'Error creating post!';
          this.isLoading = false;
        });
        return;
      }

      // If it's a poll, add the poll answers.
      if (type === 'poll') {
        for (let i = 0; i < this.pollAnswers.length; i += 1) {
          try {
            yield this.PostService.createPollAnswer(postid, { text: this.pollAnswers[i] });
          }
          catch (err) {
            this.$timeout(() => {
              this.errorMessage = err.message || 'Error creating poll answers!';
              this.isLoading = false;
            });
            return;
          }
        }
      }

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
      });

      if (this.file && type !== 'image') {
        let uploadUrl;

        try {
          uploadUrl = yield this.getUploadUrl(postid);
        }
        catch (err) {
          this.AlertsService.push('error', 'Unable to upload photo!');
          this.ModalService.OK();
        }

        try {
          yield this.UploadService.uploadImage(this.file, uploadUrl);
          this.file = null;
          this.ModalService.OK();
        }
        catch (err) {
          this.AlertsService.push('error', 'Unable to upload photo!');
          this.ModalService.OK();
        }
      }
      else {
        this.ModalService.OK();
      }
    }, this);
  }

  setFile(file) {
    this.file = file;
  }

  toggleLocked() {
    this.newPost.locked = !this.newPost.locked;
  }

  toggleNSFW() {
    this.newPost.nsfw = !this.newPost.nsfw;
  }

  togglePreview() {
    this.preview = !this.preview;
  }
}

CreatePostModalController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'AppService',
  'BranchService',
  'EventService',
  'ModalService',
  'PostService',
  'UploadService',
];

export default CreatePostModalController;
