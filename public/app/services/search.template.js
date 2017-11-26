import algoliasearch from 'algoliasearch';
import Injectable from 'utils/injectable';

const client = algoliasearch('%ALGOLIA_APP_ID%', '%ALGOLIA_SEARCH_API%');
const index = client.initIndex('your_index_name');

class Search extends Injectable {
  constructor(...injections) {
    super(Search.$inject, injections);
    this.results = [];
  }

  getResults() {
    return this.results;
  }

  search(query) {
    console.log(algoliasearch);

    if (query) {
      query = query.toString();
    }

    if (query.length < 3) {
      this.results = [];
      return;
    }

    this.API.get(`/search?q=${query}`)
      .then(res => {
        const { data } = res;
        const { results } = data;
        this.results = results;
      })
      .catch(err => this.AlertsService.push('error', err.message || err.data));
  }
}

Search.$inject = [
  'AlertsService',
  'API',
];

export default Search;
