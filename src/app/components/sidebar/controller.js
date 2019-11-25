import Injectable from 'utils/injectable';
import {get } from 'https';

class SidebarController extends Injectable {
    constructor(...injections) {
        super(SidebarController.$inject, injections);
        this.numSubBranch = 7;
        this.topBranches = [];
        const { events } = this.EventService;
        this.getSubbranches();
        const listeners = [
            this.EventService.on(events.CHANGE_BRANCH, () => this.getSubbranches()),
        ];

        this.waiting = false;
        this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

    }

    getSubbranches() {
        if (this.waiting)
            return;

        this.waiting = true;
        this.BranchService.getSubbranches(this.BranchService.branch.id, 0, "post_points")
            .then(branches => {
                this.topBranches = branches.slice(0, this.numSubBranch); //cut out only first 7
                this.waiting = false;
            })
            .catch(() => this.$timeout(() => {
                this.AlertsService.push('error', 'Error fetching top branches.');
                this.waiting = false;
            }));
    }
    getBreadcrumbsDynamicLink() {
        const viewName = this.$state.current.name;
        let view = '';

        if (viewName.includes('.subbranches')) {
            view = 'subbranches';
        }
        // if (viewName.includes('.wall')) {
        else {
            view = 'wall';
        }

        return `weco.branch.${view}`;
    }

    getLabelFollowButton() {
        if (this.BranchService.isFollowingBranch()) {
            return 'Unfollow branch';
        }

        return 'Follow branch';
    }

    isControlSelected(control) {
        return this.$state.current.name.includes(control);
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

    toggleFollowBranch() {
        let errMsg;
        let promise;
        let successMsg;

        if (this.BranchService.isFollowingBranch()) {
            errMsg = 'Error unfollowing branch.';
            successMsg = `You're no longer following b/${this.BranchService.branch.id}!`;
            promise = this.UserService.unfollowBranch(this.UserService.user.username || 'me', this.BranchService.branch.id);
        } else {
            errMsg = 'Error following branch.';
            successMsg = `You're now following b/${this.BranchService.branch.id}!`;
            promise = this.UserService.followBranch(this.UserService.user.username || 'me', this.BranchService.branch.id);
        }

        promise
            .then(() => this.AlertsService.push('success', successMsg))
            .catch(() => this.AlertsService.push('error', errMsg));
    }
}

SidebarController.$inject = [
    '$scope',
    '$state',
    'AlertsService',
    'AppService',
    'BranchService',
    'ModalService',
    'UserService',
    'EventService',
];

export default SidebarController;