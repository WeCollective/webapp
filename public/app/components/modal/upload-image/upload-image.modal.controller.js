import Injectable from 'utils/injectable.js';

class UploadImageModalController extends Injectable {
  constructor(...injections) {
    super(UploadImageModalController.$inject, injections);

    this.errorMessage = '';
    this.uploadUrl = '';
    this.file = null;
    this.isUploading = false;
    this.progress = 0;

    // fetch a presigned URL to which we can upload an image
    this.API.fetch('/:route', {
      route: this.ModalService.inputArgs.route + this.ModalService.inputArgs.type + '-upload-url'
    }).then((response) => {
      if(!response.data) throw new Error();
      this.uploadUrl = response.data;
    }).catch((response) => {
      this.AlertsService.push('error', 'Unable to upload photo!');
      this.ModalService.Cancel();
    });

    this.EventService.on(this.EventService.events.MODAL_OK, () => {
      if(!this.file) {
        this.errorMessage = 'No file selected!';
        return;
      }
      this.errorMessage = '';
      this.isUploading = true;
      this.progress = 0;
      this.upload();
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, () => {
      this.file = null;
      this.errorMessage = '';
      this.ModalService.Cancel();
    });
  }

  setFile(file) {
    this.file = file;
  }

  upload() {
    if(!this.file) {
      this.errorMessage = 'No file selected!';
      return;
    }
    this.Upload.http({
      url: this.uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': 'image/*'
      },
      data: this.file
    }).then(() => { // success
      this.file = null;
      this.isUploading = false;
      this.progress = 0;
      this.ModalService.OK();
    }, () => {  // error
      this.file = null;
      this.isUploading = false;
      this.progress = 0;
      this.errorMessage = 'Unable to upload photo!';
    }, (evt) => {  // progress
      this.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  }
}
UploadImageModalController.$inject = ['$timeout', 'API', 'ModalService', 'EventService', 'Upload'];

export default UploadImageModalController;
