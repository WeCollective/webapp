import Injectable from 'utils/injectable';

class HomeController extends Injectable {
  constructor(...injections) {
    super(HomeController.$inject, injections);

    this.stats = this.LocalStorageService.getObject('cache').homepageStats || {
      branch_count: 0,
      donation_total: 0,
      raised_total: 0,
      user_count: 0,
    };

    // Grab all constants at once.
    this.API.get('/constant')
      .then(res => {
        const { data } = res;
        const cache = this.LocalStorageService.getObject('cache');
        cache.homepageStats = cache.homepageStats || {};

        data.forEach(stat => {
          const { id } = stat;
          this.stats[id] = stat.data;
          cache.homepageStats[id] = this.stats[id];
        });

        this.LocalStorageService.setObject('cache', cache);
      })
      .catch(err => {
        console.log(err);
        this.AlertsService.push('error', 'Having trouble connecting...');
      })
      .then(this.$timeout);
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
  'LocalStorageService',
];

export default HomeController;
