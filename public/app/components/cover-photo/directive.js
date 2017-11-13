import Injectable from 'utils/injectable';

class CoverPhotoComponent extends Injectable {
  constructor (...injections) {
    super(CoverPhotoComponent.$inject, injections);

    this.bindToController = {
      canEdit: '&',
      imageUrl: '&',
      openUploadCoverModal: '=',
      thumbUrl: '&'
    };
    this.controller = 'CoverPhotoController';
    this.controllerAs = 'CoverPhoto';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.templateUrl = '/app/components/cover-photo/view.html';
  }
}

CoverPhotoComponent.$inject = [];

export default CoverPhotoComponent;
