import Injectable from 'utils/injectable';

class BranchNucleusAboutController extends Injectable {
    constructor(...injections) {
        super(BranchNucleusAboutController.$inject, injections);
        this.usrs = new Map();
        this.locks = new Map();
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

BranchNucleusAboutController.$inject = [
    'AlertsService',
    'UserService',
];

export default BranchNucleusAboutController;