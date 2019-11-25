import Injectable from 'utils/injectable';

class Search extends Injectable {
    constructor(...injections) {
        super(Search.$inject, injections);
        this.isVisible = false; //used for local search
        this.results = [];
        this.globalResults = [];
    }

    getResults(global = false) {
        if (global == false) {
            return this.results;
        } else {
            return this.globalResults;
        }
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
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }



    //add pass in the current subbranch
    searchPosts(query, global = false) {
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
                if (!global) {
                    this.results = results;
                } else
                    this.globalResults = results;
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }


    //global means that it's coming from the navbar component
    searchBranches(query, rootId = "root", global = false) {
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
                if (!global) {
                    this.results = results;
                } else {
                    this.globalResults = results;
                }
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
                this.EventService.emit(this.EventService.events.SEARCH);
            })
            .catch(err => this.AlertsService.push('error', err.message || err.data));
    }

    show() {
        this.isVisible = this.results.length > 0;
    }

    clear(global = false) {
        if (global) {
            this.globalResults = []
        } else this.results = [];
    }
}

Search.$inject = [
    '$timeout',
    'AlertsService',
    'API',
    'EventService',
];

export default Search;