import Injectable from 'utils/injectable';

class BranchController extends Injectable {
    constructor(...injections) {
        super(BranchController.$inject, injections);

    }

    // Hack fix for Angular momentarily showing both header templates on state change where
    // one of them would be detached and showing raw code, not a good UX.
    getUIViewName(isFixed) {
        if ((isFixed && this.hasFixedHeader()) || (!isFixed && !this.hasFixedHeader())) {
            return 'header';
        }

        return '';
    }

    hasFixedHeader() {
        return !this.$state.current.name.includes('weco.branch.post');
    }

    openModal(modalType) {
        const route = `branch/${this.BranchService.branch.id}/`;
        const messageType = modalType === 'profile-picture' ? 'profile' : 'cover';
        const type = modalType === 'profile-picture' ? 'picture' : 'cover';

        this.ModalService.open(
            'UPLOAD_IMAGE', { route, type },
            `Successfully updated ${messageType} picture.`,
            `Unable to update ${messageType} picture.`,
        );
    }

    // New toggle sidebar function [James 09-10-2019]
    toggleSidebarNew() {
        var leftSideBar = document.getElementsByClassName("left-side-bar")[0];
        var toggleButton = document.getElementById("toggle-button");

        // Open and close sidebar
        if (leftSideBar.style.display == "flex") {
            leftSideBar.style.display = "none";
        } else {
            leftSideBar.style.display = "flex";
        };

        // Rotate toggle arrow on click
        if (toggleButton.className == "icon toggle-in") {
            toggleButton.className = "icon toggle-out";
        } else if (toggleButton.className == "icon toggle-out") {
            toggleButton.className = "icon toggle-in";
        }
    }

    // New toggle filters fucntion [James 13-10-2019]
    toggleFilters() {
        var wallFilters = document.getElementsByClassName("wall-filters")[0];
        wallFilters.classList.toggle('reveal');
    }
}

BranchController.$inject = [
    '$scope',
    '$state',
    '$timeout',
    'BranchService',
    'EventService',
    'ModalService',
];

export default BranchController;