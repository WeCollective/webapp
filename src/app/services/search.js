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

    //searches all
    search(query) {
        if (query) {
            query = query.toString();
        } else return;

        if (query.trim().length < 3) {
            this.hide();
            this.results = [];
            this.EventService.emit(this.EventService.events.SEARCH);
            return;
        }

        this.API.get(`/search?q=${query}`)
            .then(res => {
                const { data } = res;
                const { results } = data;
                this.results = results;
                this.show();
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }




    searchPosts(query) {
        if (query) {
            query = query.toString();
        }

        if (query.trim().length < 3) {
            this.hide();
            this.results = [];
            this.EventService.emit(this.EventService.events.SEARCH);
            return;
        }

        this.API.get(`/search/posts?q=${query}`)
            .then(res => {
                const { data } = res;
                const { results } = data;
                this.results = results;
                this.show();
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }



    searchBranches(query, rootId) {
        if (query) {
            query = query.toString();
        } else return;

        if (rootId) {
            rootId = rootId.toString();
        }

        if (query.trim().length < 2) {
            this.hide();
            this.results = [];
            this.EventService.emit(this.EventService.events.SEARCH);
            return;
        }
        let apiUrl = rootId ? `/search/branches?q=${query}&rootId=${rootId}` : `/search/branches?q=${query}`;
        this.API.get(apiUrl)
            .then(res => {
                const { data } = res;
                const { results } = data;
                this.results = results;
                this.show();
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }

    searchUsers(query) {
        if (query) {
            query = query.toString();
        }

        if (query.trim().length < 3) {
            this.hide();
            this.results = [];
            this.EventService.emit(this.EventService.events.SEARCH);
            return;
        }

        this.API.get(`/search/users?q=${query}`)
            .then(res => {
                const { data } = res;
                const { results } = data;
                this.results = results;
                this.show();
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }

    show() {
        this.isVisible = this.results.length > 0;
    }
}

Search.$inject = [
    '$timeout',
    'AlertsService',
    'API',
    'EventService',
];

export default Search;