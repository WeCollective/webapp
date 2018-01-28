import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const { SortVotes } = Constants.Filters;

class BranchPostVoteController extends Injectable {
  constructor(...injections) {
    super(BranchPostVoteController.$inject, injections);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultFilters = this.setDefaultFilters.bind(this);

    this.isInit = true;
    this.isWaitingForRequest = false;
    this.items = [];
    this.selectedAnswerIndex = -1;

    this.filters = {
      sortBy: {
        items: SortVotes,
        selectedIndex: -1,
        title: 'sorted by',
      },
    };
    this.$timeout(() => this.setDefaultFilters());

    const fltrs = this.filters;
    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;

    this.sortBy = getFilterFlatItems(fltrs.sortBy);

    const listeners = [...attachFilterListeners(this.$scope, fltrs, this.callbackDropdown)];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    this.getItems();
  }

  canSubmitNewAnswer() {
    const { post } = this.PostService;
    const { user } = this.UserService;
    return !(post.locked && post.creator !== user.username);
  }

  getItems(lastAnswerId) {
    if (this.isWaitingForRequest) return;

    this.selectedAnswerIndex = -1;

    const { id } = this.PostService.post;
    const sortBy = this.getSortBy();

    this.isWaitingForRequest = true;
    this.isInit = false;
    this.PostService.getPollAnswers(id, sortBy, lastAnswerId)
      .then(answers => this.$timeout(() => {
        this.isWaitingForRequest = false;
        this.items = lastAnswerId ? this.items.concat(answers) : answers;
      }))
      .catch(err => this.$timeout(() => {
        this.isWaitingForRequest = false;
        if (err.status === 404) return;
        this.AlertsService.push('error', 'Error fetching poll answers.');
      }));
  }

  getSortBy() {
    return this.UrlService.getFilterItemParam(this.filters.sortBy, 'sort-vote');
  }

  openSubmitPollAnswerModal() {
    this.ModalService.open(
      'SUBMIT_POLL_ANSWER',
      { postid: this.PostService.post.id },
      'Answer submitted.',
      'Unable to submit answer.',
    );

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'SUBMIT_POLL_ANSWER') return;
      this.$state.go('weco.branch.post.vote', { reload: true });
    });
  }

  selectAnswer(index) {
    this.selectedAnswerIndex = this.selectedAnswerIndex !== index ? index : -1;
  }

  setDefaultFilters() {
    const { sortBy } = this.filters;
    const {
      getUrlSearchParams,
      urlToFilterItemIndex,
    } = this.UrlService;
    const { sort } = getUrlSearchParams();
    const defaultSortByIndex = 0;
    const urlIndexSortBy = urlToFilterItemIndex(sort, sortBy);

    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;

    // Set filters through service for other modules.
    setTimeout(() => {
      this.callbackDropdown();
    }, 0);
  }

  vote() {
    const answer = this.items[this.selectedAnswerIndex];

    if (!answer) return;

    this.PostService.votePollAnswer(answer.postid, answer.id)
      .then(() => this.AlertsService.push('success', 'Your vote has been cast!'))
      .catch(err => this.AlertsService.push('error', err.message || 'Error casting your vote!'));
  }
}

BranchPostVoteController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'EventService',
  'ModalService',
  'PostService',
  'UrlService',
  'UserService',
];

export default BranchPostVoteController;
