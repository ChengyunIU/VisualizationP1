class Vis {
    constructor(data) {
        let [deathdays, deaths_age_sex, pumps, streets, street_names] = data;
        this.deathdays = deathdays;
        this.deaths_age_sex = deaths_age_sex;
        // Init setting 
        this.initSetting();

        this.drawStreetMap(
            streets, pumps, street_names,
            this.mapSvg, this.mapSvgWidth, this.mapSvgHeight
        );

        this.drawLineChart(
            deathdays,
            this.tlSvg,
            this.tlSvgWidth,
            this.tlSvgHeight
        );

        this.drawLegend(this.ldSvg);

        this.drawDeathData(41);

        this.drawDistributionDeathsAndsex(
            deaths_age_sex,
            this.brSvg,
            this.brSvgWidth,
            this.brSvgHeight
        );
    }

    initSetting() {
        // Map svg
        this.mapSvg = d3.select("#svg1");
        this.mapSvgWidth = document.getElementById("svg1").clientWidth;
        this.mapSvg.style("height", this.mapSvgWidth * 0.9);
        this.mapSvgHeight = document.getElementById("svg1").clientHeight;
        // Timeline svg
        this.tlSvg = d3.select("#svg2");
        this.tlSvgWidth = document.getElementById("svg2").clientWidth;
        this.tlSvgHeight = document.getElementById("svg2").clientHeight;
        // Bar svg
        this.brSvg = d3.select("#svg3");
        this.brSvgWidth = document.getElementById("svg3").clientWidth;
        this.brSvgHeight = document.getElementById("svg3").clientHeight;
    }

    // Street Map
    drawStreetMap(streetsData, pumps, street_names, svg, w, h) {
        // Margin setting
        let margin = {
            left: 30,
            right: 30,
            top: 70,
            bottom: 10
        };
        // Define x scale
        let X = d3.scaleLinear();
        X.range([margin.left, w - margin.right]);
        X.domain(
            [
                d3.min(d3.map(streetsData, d => d3.min(d, _d => _d.x))),
                d3.max(d3.map(streetsData, d => d3.max(d, _d => _d.x)))
            ]
        );
        // Define Y scale
        let Y = d3.scaleLinear();
        Y.range([h - margin.bottom, margin.top]);
        Y.domain(
            [
                d3.min(d3.map(streetsData, d => d3.min(d, _d => _d.y))),
                d3.max(d3.map(streetsData, d => d3.max(d, _d => _d.y)))
            ]
        );
        // Define line function
        let line = d3.line()
            .curve(d3.curveLinear)
            .x(d => X(d.x))
            .y(d => Y(d.y));

        // Draw line
        svg.append("g")
            .attr("class", "street-path")
            .selectAll("path")
            .data(streetsData)
            .join("path")
            .attr("d", line);

        // Scatter plot g
        this.spSvg = this.mapSvg.append("g");

        // Legend plot g
        this.ldSvg = this.mapSvg.append("g").attr("transform", `translate(${margin.left}, ${margin.top / 2.})`);

        // Draw pumps
        svg.append("g")
            .attr("class", "pumps1")
            .selectAll("circle")
            .data(pumps)
            .join("circle")
            .attr("cx", d => X(parseFloat(d.x)))
            .attr("cy", d => Y(parseFloat(d.y)))
            .attr("r", 3)
            ;
        
            svg.append("g")
            .attr("class", "pumps2")
            .selectAll("circle")
            .data(pumps)
            .join("circle")
            .attr("cx", d => X(parseFloat(d.x)))
            .attr("cy", d => Y(parseFloat(d.y)))
            .attr("r", 6)
            ;

        this.mapXSacle = X;
        this.mapYSacle = Y;

        // Draw street names
        street_names = street_names.map(d => {
            d.x = +d.x;
            d.y = +d.y;
            d.fontsize = +d.fontsize;
            d.angle = +d.angle;
            return d;
        })
        svg.append("g")
            .selectAll("g")
            .data(street_names)
            .join("g")
            .attr("transform", d => `translate(${X(d.x)}, ${Y(d.y)})`)
            .attr("class", "street-name")
            .append("text")
            .attr("transform", d => `rotate(${d.angle})`)
            .style("font-size", d => `${d.fontsize * 1.5}px`)
            .text(d => d.text)


        // Draw title
        svg.append("g")
            .attr("class", "svg-title")
            .attr("transform", `translate(${w / 2.}, ${margin.top / 2.})`)
            .append("text")
            .text("Map");

        // svg.on("click", (e, d) => {
        //     let x = e.offsetX;
        //     let y = e.offsetY;
        //     console.log(
        //         `${X.invert(x)},${Y.invert(y)}`
        //     )
        // })

    }

    // Timeline Chart
    drawLineChart(data, svg, w, h) {
        data = data.map(d => {
            d.deaths = + d.deaths;
            return d;
        })
        // Margin setting
        let margin = {
            left: 80,
            right: 30,
            top: 10,
            bottom: 70
        };
        // Define x scale
        let X = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([margin.left, w - margin.left]);
        // Define y scale
        let Y = d3.scaleLinear()
            .range([h - margin.bottom, margin.top]);
        Y.domain([
            -10,
            d3.max(data, d => d.deaths)
        ]);
        // Line function
        let line = d3.line()
            .curve(d3.curveLinear)
            .x((d, i) => X(i))
            .y(d => Y(d.deaths));
        // Draw x axis
        let xa = d3.axisBottom(X).ticks(w / 80)
            .tickFormat(d => {
                return data[d].date;
            });
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(xa);
        // Draw y axis
        let ya = d3.axisLeft(Y).ticks(h / 50);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left - 3},0)`)
            .call(ya);
        // x-axis title
        svg.append("g")
            .attr("transform", `translate(${w / 2.}, ${h - margin.bottom / 3.})`)
            .append("text")
            .attr("class", 'x-axis-title')
            .text("Date");
        // y-axis title
        svg.append("g")
            .attr("transform", `translate(${margin.left / 2.}, ${h / 2.})`)
            .append("g")
            .append("text")
            .attr("transform", 'rotate(-90)')
            .attr("class", 'y-axis-title')
            .text("Deaths");
        // Draw line
        svg.append("g")
            .append("path")
            .attr("d", line(data))
            .attr("fill", "none")
            .attr("stroke", d3.schemeTableau10[0])
            .attr("stroke-width", 2);

        // Movemove function
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", h)
            .attr("width", w)
            .attr("opacity", 0);
        let infoLine = svg.append("line")
            .attr("y1", 0)
            .attr("y2", Y.range()[0])
            .attr("fill", "none")
            .attr("stroke", 'steelblue')
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3 2")
            .attr("opacity", 0)
            ;
        svg.on("mousemove", (e, d) => {
            let x = e.offsetX;
            let date = Math.round(X.invert(x));
            if (date >= 0 && date < data.length) {
                infoLine
                    .attr("y1", Y(data[date].deaths))
                    .attr("x1", X(date))
                    .attr("x2", X(date))
                    .attr("opacity", 1)
                    ;
                this.showTooltip(
                    `<label>Date: ${data[date].date}</label> <br\>
                     <label>Deaths: ${data[date].deaths}</label>
                    `,
                    e.pageX, e.pageY + 15
                );
                this.drawDeathData(date);
            }
            else {
                infoLine
                    .attr("y1", 0)
                    .attr("x1", X(date))
                    .attr("x2", X(date))
                    .attr("opacity", 0)
                    ;
                this.hiddenTooltip();
            }

        })
            .on("mouseout", (e, d) => {
                infoLine
                    .attr("opacity", 0)
                    ;
                this.hiddenTooltip();
            })
            ;

        // Draw title
        svg.append("g")
            .attr("class", "svg-title")
            .attr("transform", `translate(${w / 2.}, ${30})`)
            .append("text")
            .text("Date of Deaths");

    }

    drawDeathData(dateIndex) {
        let svg = this.spSvg;
        let X = this.mapXSacle;
        let Y = this.mapYSacle;

        let dataNumber = 0;
        for (let i = 0; i <= dateIndex; i++) {
            dataNumber += this.deathdays[i].deaths;
        }
        let data = this.deaths_age_sex.filter((d, i) => i < dataNumber).map(d => {
            d.x = +d.x;
            d.y = +d.y;
            d.age = +d.age;
            d.gender = +d.gender;
            return d;
        });
        // Draw circles
        let r = 3;
        svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => X(d.x))
            .attr("cy", d => Y(d.y))
            .attr("r", d => (d.age + r))
            .attr("fill", d => {
                return ['#2a6a99', '#d88546'][d.gender];
            })
            .attr("opacity", 0.95)
            .on("mousemove", (e, d) => {
                this.showTooltip(
                    `
                    <label>X: ${d.x}</label> <br\>
                    <label>Y: ${d.y}</label> <br\>
                    <label>Age: ${d.age}</label> <br\>
                    <label>Gender: ${['Male', 'Female'][d.gender]}</label> <br\>
                    `,
                    e.pageX, e.pageY + 15
                );

                d3.select(e.srcElement).attr("stroke", "red").attr("stroke-width", "1")

            })
            .on("mouseout", (e, d) => {
                this.hiddenTooltip();
                d3.select(e.srcElement).attr("stroke", "red").attr("stroke-width", "0")
            })
            ;
        ;

        // Update date legend
        this.dateLegend.text(`#Date: ${this.deathdays[dateIndex].date}`);
        // Update deaths legend
        this.deathLegend.text(`#Total Deaths: ${data.length}`);
    }

    drawDistributionDeathsAndsex(data, svg, w, h) {
        // process data
        let ageData = [
            [0, 0],  // age 0 
            [0, 0],  // age 1
            [0, 0],  // age 2 
            [0, 0],  // age 3 
            [0, 0],  // age 4 
            [0, 0],  // age 5 
        ];
        data.forEach(d => {
            let age = + d.age;
            let gender = + d.gender;
            ageData[age][gender] += 1;
        });
        // margin
        let margin = {
            left: 80,
            right: 40,
            top: 15,
            bottom: 50
        };
        // Define X scale
        let X = d3.scaleBand()
            .domain(d3.range(ageData.length))
            .rangeRound([margin.left, w - margin.right])
            .paddingInner(0.5);
        // Define Y scale
        let Y = d3.scaleLinear().range([h - margin.bottom, margin.top]);
        Y.domain([
            0,
            d3.max(ageData, d => d[0] + d[1])
        ]);

        // draw x axis 
        let xa = d3.axisBottom(X).tickFormat(d => {
            return `Age ${d}`;
        });

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${h - margin.bottom})`)
            .call(xa);

        // draw y axis 
        let ya = d3.axisLeft(Y).ticks(h / 50);
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left - 3},0)`)
            .call(ya);

        // draw x title
        svg.append("g")
            .attr("transform", `translate(${w / 2.}, ${h - margin.bottom / 3.})`)
            .append("text")
            .attr("class", 'x-axis-title')
            .text("Age");

        // draw y title
        svg.append("g")
            .attr("transform", `translate(${margin.left / 2.}, ${h / 2.})`)
            .append("g")
            .append("text")
            .attr("transform", 'rotate(-90)')
            .attr("class", 'y-axis-title')
            .text("Deaths");

        // draw bars
        //Male
        svg.append("g")
            .selectAll("rect")
            .data(ageData)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return X(i);
            })
            .attr("y", function (d) {
                return Y(d[0]);
            })
            .attr("width", X.bandwidth())
            .attr("height", function (d) {
                return h - margin.bottom - Y(d[0]);
            })
            .attr("fill", '#2a6a99')
            ;
        //Female
        svg.append("g")
            .selectAll("rect")
            .data(ageData)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return X(i);
            })
            .attr("y", function (d) {
                return Y(d[0] + d[1]);
            })
            .attr("width", X.bandwidth())
            .attr("height", function (d) {
                return h - margin.bottom - Y(d[1]);
            })
            .attr("fill", '#d88546')
            ;
        // Texts
        svg.append("g")
            .selectAll("text")
            .data(ageData)
            .enter()
            .append("text")
            .attr("x", function (d, i) {
                return X(i) + X.bandwidth() / 2.;
            })
            .attr("y", function (d) {
                return Y(d[0] + d[1]) - 5;
            })
            .text(d => d[0] + d[1])
            .attr("class", "legend-text")
            .attr("text-anchor", "middle");

        // Draw title
        svg.append("g")
            .attr("class", "svg-title")
            .attr("transform", `translate(${w / 2.}, ${30})`)
            .append("text")
            .text("Distribution of deaths by sex and age");
        
        // legend
        let leged = [
            ["Female", '#d88546'],
            ["Male", '#2a6a99'],
        ]
        
        let lg = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${0})`);
        lg.selectAll("rect")
            .data(leged)
            .join("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 15)
            .attr("width", 25)
            .attr("height", 10)
            .attr("fill", d => d[1]);
        lg.selectAll("text")
            .data(leged)
            .join("text")
            .attr("x", 30)
            .attr("y", (d, i) => i * 15 + 10)
            .text(d=>d[0])
            .attr("class", "legend-text");

    }

    drawLegend(svg) {
        // male and fmale
        let ages = [0, 1, 2, 3, 4, 5];
        let maleg = svg.append("g")
            .attr("transform", "translate(0, -12)");
        let x = 0;
        maleg.selectAll("circle")
            .data(ages)
            .join("circle")
            .attr("cx", (d) => {
                x = 0;
                for (let i = 0; i <= d; i++) {
                    x += (i + 3) * 2 + 20
                }
                return x;
            })
            .attr("cy", 0)
            .attr("r", d => d + 3)
            .attr("fill", "#2a6a99");
        maleg.append("g")
            .attr("transform", `translate(${x + 20}, 6)`)
            .attr("class", "legend-text")
            .append("text")
            .text("Male");

        let femaleg = svg.append("g")
            .attr("transform", "translate(0, 10)");
        femaleg.selectAll("circle")
            .data(ages)
            .join("circle")
            .attr("cx", (d) => {
                x = 0;
                for (let i = 0; i <= d; i++) {
                    x += (i + 3) * 2 + 20
                }
                return x;
            })
            .attr("cy", 0)
            .attr("r", d => d + 3)
            .attr("fill", "#d88546");
        femaleg.append("g")
            .attr("transform", `translate(${x + 20}, 6)`)
            .attr("class", "legend-text")
            .append("text")
            .text("Female");

        let agetextg = svg.append("g")
            .attr("transform", "translate(0, 30)");
        agetextg.append("g")
            .selectAll("text")
            .data(ages)
            .join("text")
            .attr("x", (d) => {
                x = 0;
                for (let i = 0; i <= d; i++) {
                    x += (i + 3) * 2 + 20
                }
                return x;
            })
            .text(d => `Age ${d}`)
            .attr("class", "legend-text")
            .attr("text-anchor", 'middle');

        // Date
        this.dateLegend = svg.append("g")
            .attr("transform", "translate(35, 80)")
            .append("text")
            .attr("class", "legend-text2")
            .text("#Date: 19-Aug");

        // Dathes
        this.deathLegend = svg.append("g")
            .attr("transform", "translate(35, 110)")
            .append("text")
            .attr("class", "legend-text2")
            .text("#Deaths: 1");
    }

    // tooltip
    showTooltip(html, x, y) {
        d3.select("#tooltip").html(html)
            .style("left", x + "px")
            .style("top", y + "px")
            .style("display", "")
            ;
    }
    hiddenTooltip() {
        d3.select("#tooltip")
            .style("display", "none");
    }

}

// Loading data 
Promise.all(
    [
        d3.dsv(",", "deathdays.csv"),
        d3.dsv(",", "deaths_age_sex.csv"),
        d3.dsv(",", "pumps.csv"),
        d3.json("streets.json"),
        d3.dsv(",", "street_names.csv")

    ]
)
    .then(function (data) {
        console.log(data);
        let vis = new Vis(data);

    })