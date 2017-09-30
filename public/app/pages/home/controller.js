import Injectable from 'utils/injectable';

class HomeController extends Injectable {
  constructor (...injections) {
    super(HomeController.$inject, injections);

    this.stats = this.LocalStorageService.getObject('cache').homepageStats || {
      branch_count: 0,
      donation_total: 0,
      raised_total: 0,
      user_count: 0
    };

    for (let stat of Object.keys(this.stats)) {
      this.API.get('/constant/:stat', { stat })
        .then(res => {
          this.stats[stat] = res.data.data;

          let cache = this.LocalStorageService.getObject('cache');
          cache.homepageStats = cache.homepageStats || {};
          cache.homepageStats[stat] = this.stats[stat];
          this.LocalStorageService.setObject('cache', cache);
        })
        .catch(_ => this.AlertsService.push('error', 'Having trouble connecting...'))
        .then(this.$timeout);
    }
  }

  getHomepageImageURL() {
    if ('production' === this.ENV.name) {
      return 'https://s3-eu-west-1.amazonaws.com/weco-public-assets/homepage-image.jpg';
    }
    
    return 'https://s3-eu-west-1.amazonaws.com/dev-weco-public-assets/homepage-image.jpg';
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
