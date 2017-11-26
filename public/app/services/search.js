import algoliasearch from 'algoliasearch';
import Injectable from 'utils/injectable';

const client = algoliasearch('T3T56GPPTL', '0db7251bb0180ab899e72abaff900c21');
const index = client.initIndex('getstarted_actors');

class Search extends Injectable {
  constructor(...injections) {
    super(Search.$inject, injections);
    this.results = [];
  }

  getResults() {
    return this.results;
  }

  search(query) {
    if (query) {
      query = query.toString();
    }

    if (query.length < 3) {
      this.results = [];
      return;
    }

    index.search({ query }, (err, content) => {
      if (err) {
        console.error(err);
        return;
      }

      const results = content.hits.map(result => ({ text: result.name }));
      this.results = results;
    });

    /*
    this.API.get(`/search?q=${query}`)
      .then(res => {
        const { data } = res;
        const { results } = data;
        this.results = results;
      })
      .catch(err => this.AlertsService.push('error', err.message || err.data));
    */
  }
}

Search.$inject = [
  'AlertsService',
  'API',
];

export default Search;
