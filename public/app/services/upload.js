import Injectable from 'utils/injectable';

class UploadService extends Injectable {
  constructor (...injections) {
    super(UploadService.$inject, injections);

    this.isUploading = false;
    this.progress = 0;
  }

  fetchUploadUrl (route) {
    return new Promise( (resolve, reject) => {
      // fetch a presigned URL to which we can upload an image
      this.API.fetch('/:route', { route: `${route}-upload-url` })
        .then( res => {
          if (!res.data) {
            throw new Error();
          }
          
          return resolve(res.data);
        })
        .catch(reject);
    });
  }

  uploadImage (file, uploadUrl) {
    return new Promise( (resolve, reject) => {
      if (!file) {
        return reject();
      }

      this.isUploading = true;
      this.progress = 0;

      this.Upload.http({
        url: uploadUrl,
        method: 'PUT',
        headers: {
          'Content-Type': 'image/*'
        },
        data: file
      })
        .then( () => {
          this.isUploading = false;
          this.progress = 0;
          return resolve();
        }, () => {  // error
          this.isUploading = false;
          this.progress = 0;
          return reject();
        }, evt => {  // progress
          this.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    });
  }
}

UploadService.$inject = [
  'API',
  'Upload'
];

export default UploadService;