import Injectable from 'utils/injectable';

class CoverPhotoController extends Injectable {
  constructor(...injections) {
    super(CoverPhotoController.$inject, injections);

    // Load the cached state.
    const cache = this.LocalStorageService.getObject('cache').cover || {};
    this.WallService.isCoverOpen = cache.isOpen !== undefined ? cache.isOpen : true;
  }

  hasUrls() {
    return Boolean(this.imageUrl()) && Boolean(this.thumbUrl());
  }

  toggleCoverPicture() {
    this.WallService.isCoverOpen = !this.WallService.isCoverOpen;

    // Cache the state.
    const cache = this.LocalStorageService.getObject('cache');
    cache.cover = cache.cover || {};
    cache.cover.isOpen = this.WallService.isCoverOpen;
    this.LocalStorageService.setObject('cache', cache);
  }
}

CoverPhotoController.$inject = [
  '$state',
  'BranchService',
  'LocalStorageService',
  'ModalService',
  'WallService',
];

export default CoverPhotoController;
