import Generator from 'utils/generator';
import Injectable from 'utils/injectable';

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
      locked: false,
      nsfw: false,
    };
    this.pollAnswers = [];
    this.postType = {
      items: [
        'text',
        'page',
        'image',
        'video',
        'audio',
        'poll',
      ],
      selectedIndex: 0,
    };
    this.preview = false;

    const parentBranch = this.ModalService.inputArgs.branchid;
    if (parentBranch !== 'root') {
      this.newPost.branchids.push({
        isRemovable: false,
        label: parentBranch,
      });
    }

    this.tags = this.newPost.branchids;

    const listeners = [];
    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, this.handleModalCancel));
    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, this.handleModalSubmit));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  flattenTagsArray(array) {
    if (array.length === 0 || typeof array[0] !== 'object') return array;
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
    if (this.newPost.type !== 'poll') {
      this.newPost.locked = false;
    }

    // If not all fields are filled, display error.
    if (!this.newPost || !this.newPost.title ||
      (this.BranchService.branch.id !== 'root' && !this.newPost.branchids) ||
      (!['poll', 'text'].includes(this.newPost.type) && !this.newPost.text) ||
      this.newPost.nsfw === undefined ||
      this.newPost.locked === undefined) {
      return this.$timeout(() => this.errorMessage = 'Please fill in all fields');
    }

    if (this.newPost.title.length > 200) {
      return this.$timeout(() => this.errorMessage = 'Title cannot be more than 200 characters long.');
    }

    // Perform the update.
    this.isLoading = true;

    // create copy of post to not interfere with binding of items on tag-editor
    const post = JSON.parse(JSON.stringify(this.newPost)); // JSON parsing facilitates shallow copy
    post.branchids = JSON.stringify(this.flattenTagsArray(this.newPost.branchids));

    Generator.run(function* () {
      let postid;
      try {
        postid = yield this.PostService.create(post);
      }
      catch (err) {
        return this.$timeout(() => {
          this.errorMessage = err.message || 'Error creating post!';
          this.isLoading = false;
        });
      }
      
      // If it's a poll, add the poll answers.
      if (this.newPost.type === 'poll') {
        for (let i = 0; i < this.pollAnswers.length; i += 1) {
          try {
            yield this.PostService.createPollAnswer(postid, { text: this.pollAnswers[i] });
          }
          catch (err) {
            return this.$timeout(() => {
              this.errorMessage = err.message || 'Error creating poll answers!';
              this.isLoading = false;
            });
          }
        }
      }

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
      });

      if (this.file && this.newPost.type !== 'image') {
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
