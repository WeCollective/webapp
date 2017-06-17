import Generator from 'utils/generator';
import Injectable from 'utils/injectable';

class CreatePostModalController extends Injectable {
  constructor (...injections) {
    super(CreatePostModalController.$inject, injections);

    this.errorMessage = '';
    this.file = null;
    this.isLoading = false;
    this.newPost = {
      branchids: [this.ModalService.inputArgs.branchid],
      nsfw: false,
      locked: false
    };
    this.pollAnswers = [];
    this.postType = {
      items: [
        'text',
        'page',
        'image',
        'video',
        'audio',
        'poll'
      ],
      selectedIndex: 0
    };
    this.preview = false;

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'CREATE_POST') return;

      // if not all fields are filled, display message
      if(
        !this.newPost ||
        !this.newPost.title ||
        !this.newPost.branchids ||
         this.newPost.branchids.length === 0 ||
        !this.newPost.text ||
        this.newPost.nsfw === undefined ||
        this.newPost.locked === undefined
      ) {
        return this.$timeout(() => {
          this.errorMessage = 'Please fill in all fields';
        });
      }

      // perform the update
      this.isLoading = true;
      this.newPost.type = this.postType.items[this.postType.selectedIndex].toLowerCase();
      if(this.newPost.type !== 'poll') this.newPost.locked = false;

      // create copy of post to not interfere with binding of items on tag-editor
      let post = JSON.parse(JSON.stringify(this.newPost)); // JSON parsing faciltates shallow copy
      post.branchids = JSON.stringify(this.newPost.branchids);

      Generator.run(function* () {
        let postid;
        try {
          postid = yield this.PostService.create(post);
        } catch(err) {
          return this.$timeout(() => {
            this.isLoading = false;
            this.errorMessage = err.message || 'Error creating post!';
          });
        }
        // if it's a poll, add the poll answers
        if(this.newPost.type === 'poll') {
          for (let i = 0; i < this.pollAnswers.length; i++) {
            try {
              yield this.PostService.createPollAnswer(postid, {
                text: this.pollAnswers[i]
              });
            }
            catch (err) {
              return this.$timeout( () => {
                this.isLoading = false;
                this.errorMessage = err.message || 'Error creating poll answers!';
              });
            }
          }
        }

        this.$timeout(() => {
          this.errorMessage = '';
          this.isLoading = false;
        });
        if(this.file && this.newPost.type !== 'image') {
          let uploadUrl;
          try {
            uploadUrl = yield this.getUploadUrl(postid);
          } catch(err) {
            this.AlertsService.push('error', 'Unable to upload photo!');
            this.ModalService.OK();
          }
          try {
            yield this.UploadService.uploadImage(this.file, uploadUrl);
            this.file = null;
            this.ModalService.OK();
          } catch(err) {
            this.AlertsService.push('error', 'Unable to upload photo!');
            this.ModalService.OK();
          }
        } else {
          this.ModalService.OK();
        }
      }, this);
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'CREATE_POST') return;
      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });
  }

  getUploadUrl (postid) {
    return new Promise((resolve, reject) => {
      let uploadUrlRoute = `post/${postid}/picture`;
      this.UploadService.fetchUploadUrl(uploadUrlRoute)
        .then(resolve)
        .catch(reject);
    });
  }

  setFile (file) {
    this.file = file;
  }

  togglePreview () {
    this.preview = !this.preview;
  }
}

CreatePostModalController.$inject = [
  '$timeout',
  'AlertsService',
  'AppService',
  'EventService',
  'ModalService',
  'PostService',
  'UploadService'
];

export default CreatePostModalController;
