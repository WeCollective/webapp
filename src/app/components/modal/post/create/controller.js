// todo stringify this on the server...
import Constants from 'config/constants';
import Generator from 'utils/generator';
import Injectable from 'utils/injectable';

const {
  EntityLimits,
  PostTypeImage,
  PostTypePoll,
  PostTypeText,
} = Constants;
const {
  pollAnswersMinCount,
  postText,
  postTitle,
} = EntityLimits;
const { Category } = Constants.Filters;
const { url: UrlPolicy } = Constants.Policy;

class CreatePostModalController extends Injectable {
  constructor(...injections) {
    super(CreatePostModalController.$inject, injections);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.handleModalCancel = this.handleModalCancel.bind(this);
    this.handleModalSubmit = this.handleModalSubmit.bind(this);
    this.handleUrlChange = this.handleUrlChange.bind(this);

    this.filters = {
      postType: {
        items: Category.slice(1),
        selectedIndex: -1,
        title: 'category',
      },
    };

    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;
    this.postType = getFilterFlatItems(this.filters.postType);

    this.errorMessage = '';
    this.file = null;
    this.isLoading = false;
    this.post = {
      branches: [],
      captcha: '',
      locked: false,
      nsfw: false,
      pollAnswers: [],
      text: '',
      title: '',
      type: null,
      url: '',
    };
    this.PostTypeImage = PostTypeImage;
    this.PostTypePoll = PostTypePoll;
    this.PostTypeText = PostTypeText;
    this.preview = false;
    this.timer = null;
    this.url = '';

    this.injectCurrentBranchTag();

    const { events } = this.EventService;
    const listeners = [
      ...attachFilterListeners(this.$scope, this.filters, this.callbackDropdown),
      this.EventService.on(events.MODAL_CANCEL, this.handleModalCancel),
      this.EventService.on(events.MODAL_OK, this.handleModalSubmit),
      this.$scope.$watch(() => this.post.url, this.handleUrlChange),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

    // Wait until listeners initialise.
    setTimeout(() => {
      this.filters.postType.selectedIndex = 0;
    }, 0);
  }

  callbackDropdown() {
    this.post.type = this.getPostType();
  }

  getPostType() {
    return this.UrlService.getFilterItemParam(this.filters.postType, 'type');
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

    this.isLoading = true;

    const {
      branches,
      locked,
      nsfw,
      pollAnswers,
      text,
      title,
      type,
      url,
    } = this.post;
    const { id: branchid } = this.BranchService.branch;
    let error = '';

    // Check if required fields are filled.
    if (!title || (![PostTypePoll, PostTypeText].includes(type) && !url) ||
      (type === PostTypeText && !text)) {
      error = 'Please fill in all fields.';
    }
    // Check if constraints are met.
    else if (title.length > postTitle) {
      error = `Title cannot be longer than ${postTitle} characters.`;
    }
    else if (text.length > postText) {
      error = `Text cannot be longer than ${postText} characters.`;
    }
    else if (type === PostTypePoll && locked && pollAnswers.length < pollAnswersMinCount) {
      error = `Please add at least ${pollAnswersMinCount} answers.`;
    }

    if (error) {
      this.$timeout(() => {
        this.errorMessage = error;
        this.isLoading = false;
        this.ModalService.disabled = false;
      });
      return;
    }

    this.$timeout(() => {
      this.errorMessage = '';
    });
    this.isLoading = true;

    // Create shallow copy to not interfere with binding of items on tag-editor.
    const post = JSON.parse(JSON.stringify(this.post));
    post.branches = branches.map(x => x.label);
    if (!post.branches.includes('root')) {
      post.branches = [
        'root',
        ...post.branches,
      ];
    }

    if (type !== PostTypePoll) {
      delete post.locked;
      delete post.pollAnswers;
    }

    if ([PostTypePoll, PostTypeText].includes(type)) {
      delete post.url;
    }

    Generator.run(function* () { // eslint-disable-line func-names
      let err;
      let postid;

      try {
        postid = yield this.PostService.create(post);
      }
      catch (e) {
        err = e;
      }

      if (!err) {
        // Mock the full server answer on client.
        this.PostService.posts = [
          {
            branchid,
            comment_count: 0,
            date: Date.now(),
            id: postid,
            down: 0,
            global: 1,
            individual: 1,
            local: 1,
            locked,
            nsfw,
            type,
            up: 1,
            creator: this.UserService.user.username,
            original_branches: JSON.stringify(post.branches),
            pollAnswers,
            text,
            title,
            url,
            profileUrl: '',
            profileUrlThumb: '',
            userVoted: 'up',
          },
          ...this.PostService.posts,
        ];
      }

      this.$timeout(() => {
        this.isLoading = false;
        this.ModalService.disabled = false;
      });

      if (!err && this.file && type !== PostTypeImage) {
        let uploadUrl;

        try {
          uploadUrl = yield this.getUploadUrl(postid);
        }
        catch (e) {
          this.AlertsService.push('error', 'Unable to upload photo!');
          this.ModalService.OK();
        }

        try {
          yield this.UploadService.uploadImage(this.file, uploadUrl);
          this.file = null;
          this.ModalService.OK();
        }
        catch (e) {
          this.AlertsService.push('error', 'Unable to upload photo!');
          this.ModalService.OK();
        }
      }
      else if (!err) {
        this.ModalService.OK();
      }
      else {
        this.$timeout(() => {
          this.errorMessage = err.message || 'Error creating post!';
          this.isLoading = false;
          this.ModalService.disabled = false;
        });
      }
    }, this);
  }

  handleUrlChange(str) {
    if (!str) return;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;

      const isUrl = UrlPolicy.test(str);
      if (!isUrl) return;

      this.PostService.getLinkMetaData(str)
        .then(data => this.$timeout(() => { // old (src)
          // this.url = src;

          if (data.title && !this.post.title) {
            this.post.title = data.title;
          }

          if (data.text && !this.post.text) {
            this.post.text = data.text;
          }

          if (data.url && data.url !== this.post.url) {
            this.post.url = data.url;
          }

          if (data.type) {
            const { urlToFilterItemIndex } = this.UrlService;
            const index = urlToFilterItemIndex(data.type, this.filters.postType);
            this.filters.selectedIndex = index;
            this.post.type = data.type;
          }
        }))
        .catch(err => {
          if (err.status !== 400) {
            this.AlertsService.push('error', err);
          }
        });
    }, 300);
  }

  injectCurrentBranchTag() {
    const parentBranchId = this.ModalService.inputArgs.branchid;
    if (parentBranchId !== 'root') {
      this.post.branches = [
        {
          isRemovable: false,
          label: parentBranchId,
        },
        ...this.post.branches,
      ];
    }
  }

  isDisabled() {
    return this.isLoading || this.preview;
  }

  isPreviewToggleVisible() {
    const {
      pollAnswers,
      text,
    } = this.post;
    const allowedType = [PostTypePoll, PostTypeText].includes(this.getPostType());
    const hasContent = text.length || pollAnswers.length;
    const notLoading = !this.UploadService.isUploading && !this.isLoading;
    return notLoading && hasContent && allowedType;
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
  'UrlService',
  'UserService',
];

export default CreatePostModalController;
