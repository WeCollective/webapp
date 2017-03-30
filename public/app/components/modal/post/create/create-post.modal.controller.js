import Injectable from 'utils/injectable.js';
import Generator from 'utils/generator.js';

class CreatePostModalController extends Injectable {
  constructor(...injections) {
    super(CreatePostModalController.$inject, injections);

    this.errorMessage = '';
    this.file = null;
    this.isLoading = false;
    this.preview = false;
    this.newPost = {
      branchids: [this.ModalService.inputArgs.branchid],
      nsfw: false
    };
    this.pollAnswers = [];
    this.postType = {
      items: ['TEXT', 'PAGE', 'IMAGE', 'VIDEO', 'AUDIO', 'POLL'],
      idx: 0,
      title: 'POST TYPE'
    };

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'CREATE_POST') return;

      // if not all fields are filled, display message
      if(
        !this.newPost ||
        !this.newPost.title ||
        !this.newPost.branchids ||
         this.newPost.branchids.length === 0 ||
        !this.newPost.text ||
        this.newPost.nsfw === undefined
      ) {
        return this.$timeout(() => {
          this.errorMessage = 'Please fill in all fields';
        });
      }

      // perform the update
      this.isLoading = true;
      this.newPost.type = this.postType.items[this.postType.idx].toLowerCase();

      // create copy of post to not interfere with binding of items on tag-editor
      let post = JSON.parse(JSON.stringify(this.newPost)); // JSON parsing faciltates shallow copy
      post.branchids = JSON.stringify(this.newPost.branchids);

      Generator.run(function* () {
        let success = true, postid;
        try {
          postid = yield this.PostService.create(post);
        } catch(err) { success = false; }

        // if it's a poll, add the poll answers
        if(this.newPost.type === 'poll') {
          for(let i = 0; i < this.pollAnswers.length; i++) {
            try {
              yield this.PollAnswer.create({
                postid: postid,
                text: this.pollAnswers[i]
              });
            } catch(err) { success = false; break; }
          }
        }

        if(success) {
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
            this.AlertsService.push('error', 'Unable to upload photo!');
            this.ModalService.OK();
          }
        } else {
          this.$timeout(() => {
            this.isLoading = false;
          });
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

  togglePreview() {
    this.preview = !this.preview;
  }

  getUploadUrl(postid) {
    return new Promise((resolve, reject) => {
      let uploadUrlRoute = `post/${postid}/picture-upload-url`;
      this.UploadService.fetchUploadUrl(uploadUrlRoute)
        .then(resolve)
        .catch(reject);
    });
  }

  setFile(file) {
    this.file = file;
  }
}
CreatePostModalController.$inject = ['$timeout', 'ModalService', 'UploadService', 'EventService', 'AlertsService'];

export default CreatePostModalController;
