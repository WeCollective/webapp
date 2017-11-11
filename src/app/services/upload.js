import Injectable from 'utils/injectable';

class UploadService extends Injectable {
  constructor(...injections) {
    super(UploadService.$inject, injections);

    this.isUploading = false;
    this.progress = 0;
  }

  fetchUploadUrl(route) {
    return new Promise((resolve, reject) => {
      // fetch a presigned URL to which we can upload an image
      this.API.get('/:route', { route: `${route}-upload-url` })
        .then(res => {
          if (!res.data) throw new Error();
          return resolve(res.data);
        })
        .catch(reject);
    });
  }

  uploadImage(data, url) {
    return new Promise((resolve, reject) => {
      if (!data) {
        return reject();
      }

      this.isUploading = true;
      this.progress = 0;

      return this.Upload.http({
        data,
        headers: { 'Content-Type': 'image/*' },
        method: 'PUT',
        url,
      })
        .then(() => {
          this.isUploading = false;
          this.progress = 0;
          return resolve();
        }, () => { // error
          this.isUploading = false;
          this.progress = 0;
          return reject();
        }, e => { // progress
          this.progress = Math.min(100, Number.parseInt((e.loaded * 100) / e.total, 10));
        });
    });
  }
}

UploadService.$inject = [
  'API',
  'Upload',
];

export default UploadService;
