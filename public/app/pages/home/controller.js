import Injectable from 'utils/injectable';

class HomeController extends Injectable {
  constructor (...injections) {
    super(HomeController.$inject, injections);

    this.stats = this.LocalStorageService.getObject('cache').homepageStats || {
      branch_count: 0,
      donation_total: 0,
      raised_total: 0,
      user_count: 0,
    };

    for (let stat of Object.keys(this.stats)) {
      this.API.get('/constant/:stat', { stat })
        .then(res => {
          this.stats[stat] = res.data.data;

          const cache = this.LocalStorageService.getObject('cache');
          cache.homepageStats = cache.homepageStats || {};
          cache.homepageStats[stat] = this.stats[stat];
          this.LocalStorageService.setObject('cache', cache);
        })
        .catch(() => this.AlertsService.push('error', 'Having trouble connecting...'))
        .then(this.$timeout);
    }
  }

  getHomepageImageURL() {
    const prefix = this.ENV.name === 'production' ? '' : 'dev-';
    return `https://s3-eu-west-1.amazonaws.com/${prefix}weco-public-assets/homepage-image.jpg`;
  }
}

HomeController.$inject = [
  '$timeout',
  'AlertsService',
  'API',
  'ENV',
  'LocalStorageService'
];

export default HomeController;
