import Injectable from 'utils/injectable';

class Search extends Injectable {
  constructor(...injections) {
    super(Search.$inject, injections);
    this.results = [];
  }

  search(query) {
    if (query) {
      query = query.toString();
    }

    if (query.length < 3) return;

    this.API.get('/search', { query })
      .then(res => {
        const { data } = res;
        console.log(data);
      })
      .catch(err => this.AlertsService.push('error', err.data));
  }
}

Search.$inject = [
  'AlertsService',
  'API',
];

export default Search;
