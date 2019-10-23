import Injectable from 'utils/injectable';
var d3 = require("d3");

class HomeController extends Injectable {
    //post count`
    maxDepth = 5; // Only displaying 2 layers at the moment...?
    maxSubBranches = 12;
    done = false;
    data = { name: "flare", children: [] };
    promisesToResolve = [];
    width = 932;
    height = this.width;
    pack = data => d3.pack()
        .size([this.width, this.height])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));
    format = d3.format(",d");
    color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);
    svg = null;

    generateCircles() {

        if (this.svg) {
            return null;
        }

        this.svg = "a";
        this.setData(null);
        let reducable = new Array(this.maxDepth).fill(0);
        reducable.reduce((previousPromise) => {
            return previousPromise.then(() => {
                return Promise.all(this.promisesToResolve);
            });
        }, Promise.resolve()).then(() => {

            //do circle setup stuff
            const root = this.pack(this.data);
            let focus = root;
            let view;
            const svg = d3.create("svg")
                .attr("viewBox", `-${this.width / 2} -${this.height / 2} ${this.width} ${this.height}`)
                .style("display", "block")
                .style("margin", "0 -14px")
                .style("background", this.color(0))
                .style("cursor", "pointer")
                .on("click", () => zoom(root, this.width));

            const node = svg.append("g")
                .selectAll("circle")
                .data(root.descendants().slice(1))
                .join("circle")
                .attr("fill", d => d.children ? this.color(d.depth) : "#e9f4f3")
                .attr("pointer-events", d => !d.children ? "none" : null)
                .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
                .on("mouseout", function() { d3.select(this).attr("stroke", null); })
                .on("click", d => focus !== d && (zoom(d, this.width), d3.event.stopPropagation()));

            const label = svg.append("g")
                .style("font", "18px sans-serif")
                //.attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .selectAll("text")
                .data(root.descendants())
                .join("text")
                .style("fill-opacity", d => d.parent === root ? 1 : 0)
                .style("display", d => d.parent === root ? "inline" : "none")
                .text(d => d.data.name) // Display branch name
                .on("click", function(d) { window.open("/b/" + d.data.id ); }); // Navigate to branch when branch name clicked on
            zoomTo([root.x, root.y, root.r * 2], this.width);
            var width = this.width;

            function zoomTo(v, width) {
                const k = width / v[2];
                view = v;

                label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
                node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
                node.attr("r", d => d.r * k);
            }

            function zoom(d, width) {
                const focus0 = focus;

                focus = d;

                const transition = svg.transition()
                    .duration(d3.event.altKey ? 7500 : 750)
                    .tween("zoom", d => {
                        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                        return t => zoomTo(i(t), width);
                    });

                label
                    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                    .transition(transition)
                    .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                    .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                    .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
            }

            this.svg = svg.node();
            d3.select(".circle-map").append(() => { return svg.node(); });


        });

    }



    //have to solve asdfreturn alot of promises and .then them
    setData(index) {
        if (index == null) {
            //adds promise to list
            this.promisesToResolve.push(this.BranchService.getSubbranches("root", 0, "post_points")
                .then(branches => {
                    var subBranches = branches.slice(0, this.maxSubBranches); //cut out only first 7
                    subBranches.forEach((subbranch, i) => {
                        this.data.children.push({ id: subbranch.id, name: subbranch.name, children: [], value: subbranch.post_points + 1 });
                        let ind = [i];
                        this.setData(ind);
                    });
                }));
        } else if (index.length < this.maxDepth) {
            let children = this.data.children;
            let branch;
            //find branch from ind passed
            index.forEach((val, ind) => {
                branch = children[val];
                children = branch.children;
            });
            if (!branch) return; //stop if no branch found at position
            //adds promise to list
            this.promisesToResolve.push(this.BranchService.getSubbranches(branch.id, 0, "post_points")
                .then(branches => {
                    if (branches.length == 0)
                        return;
                    var subBranches = branches.slice(0, this.maxSubBranches); //cut out only first 7
                    subBranches.forEach((subbranch, i) => {
                        branch.children.push({ id: subbranch.id, name: subbranch.name, children: [], value: subbranch.post_points + 1 });
                        let ind = index.push(i);
                        this.setData(ind);
                    });
                }));
        } else {
            this.done = true;
            return;
        }
    }

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

        this.generateCircles();
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
    'BranchService',
];

export default HomeController;