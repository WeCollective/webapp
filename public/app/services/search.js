import Injectable from 'utils/injectable';

class Search extends Injectable {
  constructor(...injections) {
    super(Search.$inject, injections);
    this.isVisible = false;
    this.results = [];
  }

  getResults() {
    return this.results;
  }

  hide() {
    this.isVisible = false;
  }

  search(query) {
    if (query) {
      query = query.toString();
    }

    if (query.length < 3) {
      this.hide();
      this.results = [];
      return;
    }

    this.API.get(`/search?q=${query}`)
      .then(res => {
        const { data } = res;
        const { results } = data;
        console.log(results);
        this.results = results;
        this.show();
      })
      .catch(err => this.AlertsService.push('error', err.message || err.data));
  }

  show() {
    this.isVisible = this.results.length > 0;
  }
}

Search.$inject = [
  'AlertsService',
  'API',
];

export default Search;
