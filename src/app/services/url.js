import Injectable from 'utils/injectable';

const filterSanityCheck = (filter = {}) => {
  filter.items = filter.items || [];
  if (filter.selectedIndex === undefined) filter.selectedIndex = 0;
  return filter;
};

class Url extends Injectable {
  constructor(...injections) {
    super(Url.$inject, injections);

    this.applyFilter = this.applyFilter.bind(this);
    this.getFilterItemParam = this.getFilterItemParam.bind(this);
    this.getUrlSearchParams = this.getUrlSearchParams.bind(this);
  }

  // Inserts the current filter setting into the url for sharing or refreshing webpage.
  // The history state is replaced to preserve the back button functionality.
  applyFilter(filter, key) {
    if (filter.selectedIndex !== -1) {
      this.$location.search(key, this.getFilterItemKey(filter, 'url'));
    }

    this.$location.replace();
  }

  // Listen to filter changes and call the callback method on change.
  attachFilterListeners(scope, filters, callback) {
    let listeners = [];
    Object.keys(filters).forEach(key => {
      const filter = filterSanityCheck(filters[key]);
      const listener = scope.$watch(() => filter.selectedIndex, (newValue, oldValue) => {
        if (newValue !== oldValue) callback(newValue);
      });
      listeners = [
        ...listeners,
        listener,
      ];
    });
    return listeners;
  }

  getFilterFlatItems(filter) {
    filter = filterSanityCheck(filter);
    return filter.items.map(x => x.label);
  }

  getFilterItemParam(filter = {}, type) {
    filter = filterSanityCheck(filter);

    if (filter.selectedIndex === -1) return null;

    const url = this.getFilterItemKey(filter, 'url');

    switch (type) {
      case 'sort':
        return this.parseFilterSort(url);

      case 'sort-branch':
        return this.parseFilterSortBranch(url);

      case 'sort-flag':
        return this.parseFilterSortFlag(url);

      case 'sort-vote':
        return this.parseFilterSortVote(url);

      case 'stat':
        return this.parseFilterStat(url);

      case 'time':
        return this.parseFilterTime(url);

      case 'type':
        return url;

      default:
        return false;
    }
  }

  // Works with the app filter structure to extract the selected item url.
  getFilterItemKey(filter, key) {
    filter = filterSanityCheck(filter);
    const item = filter.items[filter.selectedIndex] || {};
    return item[key];
	
  }

  getUrlSearchParams() {
    return this.$location.search();
  }

  parseFilterSort(url) {
    switch (url) {
      case 'comments':
      case 'date':
      case 'points':
        return url;

      default:
        return 'points';
    }
  }

  parseFilterSortBranch(url) {
    switch (url) {
      case 'comments':
      case 'points':
        return `post_${url}`;

      case 'posts':
        return 'post_count';

      case 'date':
      default:
        return 'date';
    }
  }

  parseFilterSortFlag(url) {
    switch (url) {
      case 'flag-branch-rules':
        return 'branch_rules';

      case 'flag-nsfw':
        return 'nsfw';

      case 'flag-site-rules':
        return 'site_rules';

      case 'flag-wrong-type':
        return 'wrong_type';

      case 'date':
      default:
        return 'date';
    }
  }

  parseFilterSortVote(url) {
    switch (url) {
      case 'date':
      case 'votes':
        return url;

      default:
        return 'date';
    }
  }

  parseFilterStat(url) {
    switch (url) {
      case 'branch':
        return 'individual';

      case 'global':
      case 'local':
      default:
        return url;
    }
  }

  parseFilterTime(url) {
    switch (url) {
      case 'year':
        return new Date().setFullYear(new Date().getFullYear() - 1);

      case 'month':
        return new Date().setMonth(new Date().getMonth() - 1);

      case 'week':
        return new Date().setDate(new Date().getDate() - 7);

      case 'day':
        return new Date().setDate(new Date().getDate() - 1);

      case 'hour':
        return new Date().setHours(new Date().getHours() - 1);

      case 'all':
      default:
        return 0;
    }
  }

  // Finds the item in array with the matching url value and returns its index.
  urlToFilterItemIndex(str, filter) {
    const { items: arr } = filterSanityCheck(filter);
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].url === str) {
        return i;
      }
    }
    return -1;
  }
}

Url.$inject = [
  '$location',
];

export default Url;
