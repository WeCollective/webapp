import Injectable from 'utils/injectable.js';

class UploadImageModalController extends Injectable {
  constructor(...injections) {
    super(UploadImageModalController.$inject, injections);

    this.uploadUrl = '';
    this.errorMessage = '';
    this.file = null;

    let getUploadUrl = () => {
      let uploadUrlRoute = this.ModalService.inputArgs.route + this.ModalService.inputArgs.type;
      this.UploadService.fetchUploadUrl(uploadUrlRoute).then((uploadUrl) => {
        this.uploadUrl = uploadUrl;
      }).catch(() => {
        this.AlertsService.push('error', 'Unable to upload photo!');
        this.ModalService.Cancel();
      });
    };

    getUploadUrl();
    this.EventService.on(this.EventService.events.MODAL_OPEN, (name) => {
      if(name !== 'UPLOAD_IMAGE') return;
      getUploadUrl();
    });

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'UPLOAD_IMAGE') return;
      if(!this.file) {
        this.errorMessage = 'No file selected!';
        return;
      }
      this.errorMessage = '';
      this.UploadService.uploadImage(this.file, this.uploadUrl).then(() => {
        this.file = null;
        this.ModalService.OK();
      }).catch(() => {
        this.$timeout(() => {
          this.file = null;
          this.errorMessage = 'Unable to upload photo!';
        });
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'UPLOAD_IMAGE') return;
      this.file = null;
      this.errorMessage = '';
      this.ModalService.Cancel();
    });
  }

  setFile(file) {
    this.file = file;
  }
}
UploadImageModalController.$inject = ['$timeout', 'API', 'ModalService', 'EventService', 'UploadService'];

export default UploadImageModalController;
