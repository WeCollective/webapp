import Injectable from 'utils/injectable';

const GROUP_ANSWERS_INDEX_LIMIT = 7;

class BranchPostResultsController extends Injectable {
  constructor(...injections) {
    super(BranchPostResultsController.$inject, injections);

    this.answers = [];
    this.chart = {
      data: [],
      labels: [],
      options: {
        legend: {
          display: false,
        },
        tooltips: {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          callbacks: {
            label: tooltipItem => tooltipItem.index + 1,
          },
          displayColors: false,
        },
      },
      type: 'pie',
    };
    this.isInit = true;
    this.isWaitingForRequest = false;

    this.getPollAnswers();

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.STATE_CHANGE_SUCCESS, () => this.getPollAnswers()),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  // Params: lastAnswerId
  getPollAnswers() {
    if (this.isWaitingForRequest) return;

    this.isWaitingForRequest = true;
    this.isInit = false;
    this.PostService.getPollAnswers(this.PostService.post.id, 'votes', undefined)
      .then(answers => this.$timeout(() => {
        this.isWaitingForRequest = false;

        let chartData = [];
        let chartLabels = [];
        // Check if the chart data is different - prevents the laggy render effect on data change.
        let isDiff = false;

        const totalVotes = this.getTotalVotes(answers);

        answers.forEach((answer, index) => {
          if (index <= GROUP_ANSWERS_INDEX_LIMIT) {
            chartData = [
              ...chartData,
              answer.votes,
            ];
            chartLabels = [
              ...chartLabels,
              index + 1,
            ];
          }
          else {
            chartData[GROUP_ANSWERS_INDEX_LIMIT] += answer.votes;
          }

          answer.ratioOfTotal = totalVotes ? Math.floor((answer.votes / totalVotes) * 100) : 0;

          return answer;
        });

        if (answers.length !== this.answers.length ||
          chartData.length !== this.chart.data.length ||
          chartLabels.length !== this.chart.labels.length) {
          isDiff = true;
        }

        if (!isDiff) {
          for (let i = 0; i < chartData.length; i += 1) {
            if (chartData[i] !== this.chart.data[i] ||
              chartLabels[i] !== this.chart.labels[i]) {
              isDiff = true;
              break;
            }
          }
        }

        this.answers = answers;

        if (isDiff) {
          this.chart.data = chartData;
          this.chart.labels = chartLabels;
        }
      }))
      .catch(err => {
        this.isWaitingForRequest = false;
        if (err.status === 404) return;
        this.AlertsService.push('error', 'Error fetching poll answers.');
      });
  }

  getTotalVotes(arr) {
    let totalVotes = 0;
    if (arr.length) {
      totalVotes = (arr.length > 1) ? arr.reduce((a, b) => ({ votes: a.votes + b.votes })) : arr[0];
      totalVotes = totalVotes.votes;
    }
    return totalVotes;
  }

  // indicate whether the poll has been voted yet ie. do we have results to show
  hasSomeVotes() {
    for (const datum of this.chart.data) { // eslint-disable-line no-restricted-syntax
      if (datum !== 0) return true;
    }
    return false;
  }
}

BranchPostResultsController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'EventService',
  'PostService',
];

export default BranchPostResultsController;
