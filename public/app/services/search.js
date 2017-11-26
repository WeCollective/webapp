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

    this.API.get(`/search?q=${query}`)
      .then(res => {
        const { data } = res;
        console.log(data);
      })
      .catch(err => {
        if (err && typeof err === 'object' && err.message) {
          this.AlertsService.push('error', err.message);
        }
        else {
          this.AlertsService.push('error', err.data);
        }
      });
  }
}

Search.$inject = [
  'AlertsService',
  'API',
];

export default Search;
