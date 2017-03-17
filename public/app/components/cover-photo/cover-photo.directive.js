import Injectable from 'utils/injectable';

class CoverPhotoComponent extends Injectable {
  constructor(...injections) {
    super(CoverPhotoComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {};
    this.bindToController = {
      imageUrl: '&',
      thumbUrl: '&',
      canEdit: '&',
      isOpen: '='
    };
    this.templateUrl = '/app/components/cover-photo/cover-photo.view.html';
    this.controllerAs = 'CoverPhoto';
    this.controller = 'CoverPhotoController';
  }
}
CoverPhotoComponent.$inject = [];

export default CoverPhotoComponent;
