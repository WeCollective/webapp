import Chart from 'chart.js';
import Injectable from 'utils/injectable';

const GROUP_ANSWERS_INDEX_LIMIT = 7;

class BranchPostResultsController extends Injectable {
  constructor(...injections) {
    super(BranchPostResultsController.$inject, injections);

    let cache = this.LocalStorageService.getObject('cache').postPoll || {};
    cache = cache[this.PostService.post.id] || {};

    this.answers = cache.answers || [];
    this.chart = {
      data: cache.chartData || [],
      labels: cache.chartLabels || [],
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

    this.getPollAnswers();

    const listeners = [];
    const { events } = this.EventService;
    listeners.push(this.EventService.on(events.STATE_CHANGE_SUCCESS, () => this.getPollAnswers()));
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  // Params: lastAnswerId
  getPollAnswers() {
    this.PostService.getPollAnswers(this.PostService.post.id, 'votes', undefined)
      .then(answers => this.$timeout(() => {
        const chartData = [];
        const chartLabels = [];
        // Check if the chart data is different - prevent the laggy render effect on data change.
        let isDiff = false;

        const totalVotes = this.getTotalVotes(answers);

        answers.forEach((answer, index) => {
          if (index <= GROUP_ANSWERS_INDEX_LIMIT) {
            chartData.push(answer.votes);
            chartLabels.push(index + 1);
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

        const cache = this.LocalStorageService.getObject('cache');
        cache.postPoll = cache.postPoll || {};
        cache.postPoll[this.PostService.post.id] = cache.postPoll[this.PostService.post.id] || {};
        cache.postPoll[this.PostService.post.id].answers = this.answers;
        cache.postPoll[this.PostService.post.id].chartData = this.chart.data;
        cache.postPoll[this.PostService.post.id].chartLabels = this.chart.labels;
        this.LocalStorageService.setObject('cache', cache);
      }))
      .catch(err => {
        if (err.status !== 404) {
          this.AlertsService.push('error', 'Error fetching poll answers.');
        }
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
  'LocalStorageService',
  'PostService',
];

export default BranchPostResultsController;
