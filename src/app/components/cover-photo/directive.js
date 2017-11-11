import Injectable from 'utils/injectable';
import View from './view.html';

class CoverPhotoComponent extends Injectable {
  constructor(...injections) {
    super(CoverPhotoComponent.$inject, injections);

    this.bindToController = {
      canEdit: '&',
      imageUrl: '&',
      openUploadCoverModal: '=',
      thumbUrl: '&',
    };
    this.controller = 'CoverPhotoController';
    this.controllerAs = 'CoverPhoto';
    this.replace = true;
    this.restrict = 'E';
    this.scope = {};
    this.template = View;
  }
}

CoverPhotoComponent.$inject = [];

export default CoverPhotoComponent;
