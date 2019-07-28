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
        .then(res => {
          this.isUploading = false;
          this.progress = 0;
          return resolve(res);
        }, () => { // error
          this.isUploading = false;
          this.progress = 0;
          return reject();
        }, e => { // progress
          this.progress = Math.min(100, Number.parseInt((100 * e.loaded) / e.total, 10));
        });
    });
  }
  
  
  uploadImageFromUrl(route,image_url,postid) {
	  
    return new Promise((resolve, reject) => {
      if (!image_url) {
        return reject();
      }
	     this.isUploading = true;
      this.progress = 0;
	  var data = {link:image_url,pid:postid};
      this.API.post('/:route', { route: `${route}-upload-by-url`},data)
        .then(res => {
          
		  this.isUploading = false;
          this.progress = 0;
		  if (res.data)
			return resolve(res.data);
		  else return resolve();
        })
		 .catch(reject);
       
		   
		
    });
  }
}

UploadService.$inject = [
  '$http',
  'API',
  'Upload',
  'AlertsService',
];

export default UploadService;
