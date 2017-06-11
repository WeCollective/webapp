import Injectable from 'utils/injectable';

class UploadImageModalController extends Injectable {
  constructor (...injections) {
    super(UploadImageModalController.$inject, injections);

    this.setFile = this.setFile.bind(this);
    this.setUploadUrl = this.setUploadUrl.bind(this);

    this.errorMessage = '';
    this.file = null;
    this.uploadUrl = '';

    this.setUploadUrl();

    let listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if ('UPLOAD_IMAGE' !== name) return;

      this.errorMessage = !this.file ? 'No file selected!' : '';
      
      if (!this.file) return;

      this.UploadService.uploadImage(this.file, this.uploadUrl)
        .then(_ => {
          this.file = null;
          this.ModalService.OK();
        })
        .catch(_ => this.$timeout(_ => {
          this.file = null;
          this.errorMessage = 'Unable to upload photo!';
        }));
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if ('UPLOAD_IMAGE' !== name) return;
      this.file = null;
      this.errorMessage = '';
      this.ModalService.Cancel();
    }));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  setFile (file) {
    this.file = file;
  }

  setUploadUrl () {
    const args = this.ModalService.inputArgs;
    this.UploadService.fetchUploadUrl(args.route + args.type)
      .then(uploadUrl => this.uploadUrl = uploadUrl)
      .catch(_ => {
        this.AlertsService.push('error', 'Unable to upload photo!');
        this.ModalService.Cancel();
      });
  }
}

UploadImageModalController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'API',
  'EventService',
  'ModalService',
  'UploadService'
];

export default UploadImageModalController;
