import Injectable from 'utils/injectable.js';

class UploadImageModalController extends Injectable {
  constructor(...injections) {
    super(UploadImageModalController.$inject, injections);

    this.errorMessage = '';
    this.file = null;
    this.uploadUrl = '';

    const setUploadUrl = _ => {
      const args = this.ModalService.inputArgs;
      this.UploadService.fetchUploadUrl(args.route + args.type)
        .then( uploadUrl => this.uploadUrl = uploadUrl )
        .catch( _ => {
          this.AlertsService.push('error', 'Unable to upload photo!');
          this.ModalService.Cancel();
        });
    };

    setUploadUrl();
    
    this.EventService.on(this.EventService.events.MODAL_OPEN, name => {
      if ('UPLOAD_IMAGE' !== name) return;
      setUploadUrl();
    });

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if ('UPLOAD_IMAGE' !== name) return;

      this.errorMessage = this.file ? '' : 'No file selected!';
      
      if (!this.file) return;

      this.UploadService.uploadImage(this.file, this.uploadUrl)
        .then( _ => {
          this.file = null;
          this.ModalService.OK();
        })
        .catch( _ => {
          this.$timeout( _ => {
            this.file = null;
            this.errorMessage = 'Unable to upload photo!';
          });
        });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if ('UPLOAD_IMAGE' !== name) return;
      this.file = null;
      this.errorMessage = '';
      this.ModalService.Cancel();
    });
  }

  setFile (file) {
    this.file = file;
  }
}

UploadImageModalController.$inject = [
  '$timeout',
  'AlertsService',
  'API',
  'EventService',
  'ModalService',
  'UploadService'
];

export default UploadImageModalController;