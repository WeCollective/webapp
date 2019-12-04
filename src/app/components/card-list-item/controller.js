import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const {
    PostTypeAudio,
    PostTypeImage,
    PostTypePage,
    PostTypePoll,
    PostTypeText,
    PostTypeVideo,
} = Constants;

class ListItemController extends Injectable {
    constructor(...injections) {
        super(ListItemController.$inject, injections);
        this.usrs = new Map();
        this.locks = new Map();
    }

    getMarkerClass() {
        const prefix = 'style--';

        switch (this.post.type) {
            case PostTypeAudio:
                return `${prefix}audio`;

            case PostTypeImage:
                return `${prefix}image`;

            case PostTypePage:
                return `${prefix}page`;

            case PostTypePoll:
                return `${prefix}poll`;

            case PostTypeText:
                return `${prefix}text`;

            case PostTypeVideo:
                return `${prefix}video`;

            default:
                return '';
        }
    }

    getOriginalBranches() {
        let branches = [];

        if (this.post.original_branches) {
            try {
                branches = JSON.parse(this.post.original_branches);
                const index = branches.indexOf('root');
                if (index !== -1 && branches.length > 1) {
                    branches = [
                        ...branches.slice(0, index),
                        ...branches.slice(index + 1),
                    ];
                }
            } catch (err) {
                console.log(err);
            }
        }

        return branches;
    }

    getOriginalBranchesTooltipString() {
        const originalBranches = this.getOriginalBranches();
        let string = '';

        for (let i = 1; i < originalBranches.length; i += 1) {
            const branchid = originalBranches[i];
            if (branchid !== 'root') {
                const target = this.$state.href('weco.branch.wall', { branchid });
                string += `<a class="tooltip-row" ng-href="${target}">${branchid}</a>`;
            }
        }

        return string;
    }

    getPostImage() {
        const IMG_DIR = '/assets/images/placeholders/';
        return this.post.profileUrlThumb || `${IMG_DIR}post--${this.post.type}.svg`;
    }

    getPostTarget(post) {
        const {
            id: postid,
            type,
        } = post;

        switch (type) {
            case PostTypePoll:
                return this.$state.href('weco.branch.post.vote', { postid });

            default:
                return this.$state.href('weco.branch.post', { postid });
        }
    }

    getPostUrl() {
        let url = this.post.url || this.post.text || '';
        if (url && !url.includes('http')) {
            url = `https://${url}`;
        }
        return url;
    }

    getTotalFlagCount() {
        const counts = [
            'branch_rules_count',
            'nsfw_count',
            'site_rules_count',
            'wrong_type_count',
        ];

        let total = 0;

        counts.forEach(key => {
            if (this.post[key]) {
                total += (Number.isNaN(this.post[key]) ? 0 : this.post[key]);
            }
        });

        return total;
    }

    isOwnPost() {
        return this.post && this.UserService.user.username === this.post.creator;
    }

    openDeletePostModal() {
        this.ModalService.open(
            'DELETE_POST', { postid: this.post.id },
            'Post deleted.',
            'Unable to delete post.',
        );

        this.EventService.on(this.EventService.events.MODAL_OK, name => {
            if (name !== 'DELETE_POST') return;
            this.$state.go(this.$state.current.name, { reload: true });
        });
    }

    openRePostModal() {
        this.ModalService.open(
            'REPOST', { post: this.post },
            'Post Reposted.',
            'Unable to repost post.',
        );
    }

    openFlagPostModal() {
        this.ModalService.open(
            'FLAG_POST', {
                forceUpdate: false,
                post: this.post,
                branchid: this.BranchService.branch.id,
            },
            'Post flagged. The branch moderators will be informed.',
            'Unable to flag post.',
        );
    }

    openResolveFlagPostModal() {
        this.ModalService.open(
            'RESOLVE_FLAG_POST', { post: this.post },
            'Done.',
            'Error resolving flags on post.',
        );
    }

    showFlags() {
        return this.$state.current.name.includes('weco.branch.nucleus');
    }

    showVotes() {
        return !!this.stat;
    }

    vote(direction, iconNode) {
        this.PostService.vote(this.BranchService.branch.id, this.post.id, direction)
            .then(res => this.$timeout(() => {
                const delta = res.delta || 0;

                this.post.individual += delta;
                this.post.local += delta;
                this.post.global += delta;

                if (this.post.userVoted) {
                    delete this.post.userVoted;
                } else {
                    this.post.userVoted = direction;
                }

                if (iconNode) {
                    if (direction === 'up') {
                        if (delta > 0) {
                            iconNode.classList.add('style--active');
                        } else {
                            iconNode.classList.remove('style--active');
                        }
                    }
                }
            }))
            .catch(err => {
                const {
                    message,
                    status,
                } = err;

                let error = '';

                switch (status) {
                    case 400:
                        error = 'Invalid request - there was an issue on our side!';
                        break;

                    case 403:
                        error = 'Please log in or create an account to like posts.';
                        break;

                    case 500:
                        error = 'Please log in or create an account to like posts.';
                        break;

                    default:
                        error = message;
                        break;
                }

                this.AlertsService.push('error', error);
            });
    }
    getUser(username) {

        if (username == null)
            return;

        //lock so that it does not make more than one api call
        if (this.locks.get(username) === undefined) {

            this.locks.set(username, true);

            //get the user and set
            var md = new Promise(resolve => this.UserService.fetch('' + username)
                .then(user => resolve(user))
                .catch(() => {
                    this.AlertsService.push('error', 'Error fetching user.');
                    return resolve();
                }));
            md.then(user => {
                this.usrs.set(username, user);
            });
        }

        return this.usrs.get(username);
    }
}

ListItemController.$inject = [
    '$state',
    '$timeout',
    'AlertsService',
    'AppService',
    'BranchService',
    'DateService',
    'EventService',
    'ModalService',
    'PostService',
    'UserService',
];

export default ListItemController;