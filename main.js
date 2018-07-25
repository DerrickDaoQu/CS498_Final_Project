var pageIndex = 1;
var totalPages = 5;
var dashboardAnimated = true;
var displayToolTip = true;

document.addEventListener('DOMContentLoaded', function (e) {
    pagers = document.querySelectorAll('.pager>span');
    for (var i = 0; i < pagers.length; i++) {
        pagers[i].addEventListener('click', function (e) {
            var newIndex = Number(e.target.innerHTML);
            if (pageIndex == newIndex) {
                return;
            }
            pageIndex = newIndex;
            UpdateViz();
        })
    }

    UpdateViz();
});

function navigatorClicked(i) {
    pageIndex += Number(i);
    UpdateViz();
}

function animateChanged() {
    var cb = document.querySelector('#dash-animate-checkbox');
    dashboardAnimated = cb.checked;
    UpdateViz();
}

function displayToolTipChanged() {
    var cb = document.querySelector('#display-tooltip-checkbox');
    displayToolTip = cb.checked;
}

function UpdateViz() {
    d3.select('#navigator-left').style('opacity', '1').style('pointer-events', 'all');
    d3.select('#navigator-right').style('opacity', '1').style('pointer-events', 'all');
    if (pageIndex <= 1) {
        pageIndex = 1;
        d3.select('#navigator-left').style('opacity', '0').style('pointer-events', 'none');
    }
    else if (pageIndex >= totalPages) {
        pageIndex = totalPages;
        d3.select('#navigator-right').style('opacity', '0').style('pointer-events', 'none');
    }

    d3.selectAll('.pager>span').classed('selected', false);
    d3.select('.pager>span:nth-child(' + (pageIndex) + ')').classed('selected', true);


    d3.selectAll('div[id^=page]').style('display', 'none');
    d3.select('div[id=page' + pageIndex + ']').style('display', 'flex');
    pageTitle = document.querySelector('#title');
    switch (pageIndex) {
        case 1:
            pageTitle.innerHTML = 'CS498 Final Project Overview';
            break;
        case 2:
            pageTitle.innerHTML = 'Term Subscription Overview';
            UpdatePie();
            break;
        case 3:
            pageTitle.innerHTML = 'Whether Having Loan Affects the Subscription Decision';
            UpdateBubbleChart();
            break;
        case 4:
            pageTitle.innerHTML = 'How Decision Making Varies among Job Categories';
            UpdateStackedBar(null);
            break;
        case 5:
            pageTitle.innerHTML = 'Wrap Up & Final Thoughts';
            break;
    }
}

function UpdateStackedBar(sortBy) {
    d3.select('#canvas_page4').selectAll('*').remove();
    var canvasContainer = d3.select('#canvas_page4').node();
    var width = canvasContainer.getBoundingClientRect().width;
    var height = canvasContainer.getBoundingClientRect().height;
    var margin = 50;
    var transition_duration = dashboardAnimated ? 1000 : 0;
    var data = [
        { 'label': 'Retired', 'Yes': 54, 'No': 176 },
        { 'label': 'Student', 'Yes': 19, 'No': 65 },
        { 'label': 'Management', 'Yes': 131, 'No': 838 },
        { 'label': 'Housemaid', 'Yes': 14, 'No': 98 },
        { 'label': 'Admin.', 'Yes': 58, 'No': 420 },
        { 'label': 'Self-Employed', 'Yes': 20, 'No': 163 },
        { 'label': 'Technician', 'Yes': 83, 'No': 685 },
        { 'label': 'Unemployed', 'Yes': 13, 'No': 115 },
        { 'label': 'Serivces', 'Yes': 38, 'No': 379 },
        { 'label': 'Entrepreneur', 'Yes': 15, 'No': 153 },
        { 'label': 'Blue-Collar', 'Yes': 69, 'No': 877 }
    ];

    for (var i = 0; i < data.length; i++) {
        data[i]['acceptRate'] = Number(data[i]['Yes'] * 100 / (data[i]['Yes'] + data[i]['No'])).toFixed(0);
    }

    var svg = d3.select('#canvas_page4').append('svg').attr('width', width).attr('height', height);
    width -= 2 * margin;
    height -= 2 * margin;

    var x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05)
        .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal().range([d3.schemeCategory10[1], d3.schemeCategory10[0]]);

    var keys = ['Yes', 'No'];

    g = svg.append('g').attr('transform', 'translate(' + margin + ',' + margin + ')');

    if (sortBy == null) {
        sortBy = 'acceptRate';
    }

    switch (sortBy) {
        case 'acceptance':
            data.sort(function (a, b) { return b['Yes'] - a['Yes']; });
            break;
        case 'acceptRate':
            data.sort(function (a, b) { return b['acceptRate'] - a['acceptRate']; });
            break;
        case 'rejection':
            data.sort(function (a, b) { return b['No'] - a['No']; });
            break;
    }

    x.domain(data.map(function (d) { return d['label']; }));
    y.domain([0, d3.max(data, function (d) { return d['Yes'] + d['No']; })]).nice();
    z.domain(keys);

    g.append('g')
        .selectAll('g')
        .data(d3.stack().keys(keys)(data))
        .enter().append('g')
        .attr('fill', function (d) { return z(d.key); })
        .selectAll('rect')
        .data(function (d) { return d; })
        .enter().append('rect')
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('value', 'bar')
        .attr('x', function (d) { return x(d['data']['label']); })
        .attr('y', function (d) { return y(d[1]); })
        .transition()
        .duration(transition_duration)
        .attr('height', function (d) { return y(d[0]) - y(d[1]); });


    g.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).ticks())
        .append('text')
        .attr('x', 2)
        .attr('y', y(y.ticks().pop()) + 0.5)
        .attr('dy', '0.32em')
        .attr('fill', '#000')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'start');

    var legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(keys.slice().reverse())
        .enter().append('g')
        .attr('transform', function (d, i) { return 'translate(0,' + i * 20 + ')'; });

    legend.append('rect')
        .attr('x', width + 24)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', z);

    legend.append('text')
        .attr('x', width + 19)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(function (d) { return d; });

    div = d3.select('.toolTip');
    d3.selectAll('rect[value=bar]').on('mousemove', function (d, i) {
        div.style('left', d3.event.pageX + 10 + 'px');
        div.style('top', d3.event.pageY + 10 + 'px');
        if (displayToolTip) {
            div.style('display', 'inline-block');
        }
        else {
            div.style('display', 'none');
        }
        div.html((d[0] == 0 ? 'Offer Accepted' : 'Offer Rejected') + ': ' + d[1] + '<br>' + 'Group Success Rate: ' + d['data']['acceptRate'] + '%');
        svg.selectAll('.bar').attr('stroke', 'none');
        d3.select(this).attr('stroke', 'black');
    })

    d3.selectAll('rect[value=bar]').on('mouseout', function (d) {
        div.style('display', 'none');
        svg.selectAll('rect[value=bar]').attr('stroke', 'none');
    });
}

function sortByChanged() {
    var sortBy = document.querySelector('#sort-by').value;

    UpdateStackedBar(sortBy);
}

function UpdateBubbleChart() {
    d3.select('#canvas_page3').selectAll('*').remove();
    var canvasContainer = d3.select('#canvas_page3').node();
    var width = canvasContainer.getBoundingClientRect().width;
    var height = canvasContainer.getBoundingClientRect().height;
    var margin = 30;
    var transition_duration = dashboardAnimated ? 1000 : 0;
    var data = { 'children': [{ 'label': ['Has Loan? No', 'Term Subscribed? No'], 'value': 3321, 'fillColor': d3.schemeCategory10[0], 'factor': 1 }, { 'label': ['Has Loan? Yes', 'Term Subscribed? No'], 'value': 648, 'fillColor': d3.schemeCategory10[0], 'factor': 1 }, { 'label': ['Has Loan? No', 'Term Subscribed? Yes'], 'value': 472, 'fillColor': d3.schemeCategory10[1], 'factor': 1 }, { 'label': ['Yes', 'Yes'], 'value': 42, 'fillColor': d3.schemeCategory10[1], 'factor': 2 }] };
    var total = 0;
    var factored_total = 0;
    for (var i = 0; i < data['children'].length; i++) {
        total += data['children'][i]['value'];
        factored_total += data['children'][i]['value'] * data['children'][i]['factor'];
    }

    var svg = d3.select('#canvas_page3').append('svg').attr('width', width).attr('height', height);
    var bubble = d3.pack()
        .size([width, height])
        .padding(1.5);
    var nodes = d3.hierarchy(data)
        .sum(function (d) { return d['value'] * d['factor']; });

    var node = svg.selectAll('.node')
        .data(bubble(nodes).descendants())
        .enter()
        .filter(function (d) {
            return !d.children
        })
        .append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });

    node.append('circle')
        .attr('r', 0)
        .style('fill', function (d) {
            return d['data']['fillColor'];
        })
        .transition()
        .duration(transition_duration)
        .attr('r', function (d) {
            return d.r;
        });

    node.append('text')
        .attr('dy', '2em')
        .text(function (d) {
            return d['data']['label'][0];
        })
        .attr('font-family', 'sans-serif')
        .attr('font-size', function (d) {
            return d['data']['label'][0].length > 5 ? d.r / 5.5 : d.r / 2;
        })
        .attr('fill', 'white')
        .attr('opacity', '0')
        .transition()
        .duration(transition_duration)
        .delay(transition_duration)
        .attr('dy', '-0.2em')
        .style('text-anchor', 'middle')
        .attr('opacity', '1')

    node.append('text')
        .transition()
        .duration(transition_duration)
        .delay(transition_duration)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(function (d) {
            return d['data']['label'][1];
        })
        .attr('font-family', 'sans-serif')
        .attr('font-size', function (d) {
            return d['data']['label'][1].length > 5 ? d.r / 5.5 : d.r / 2;
        })
        .attr('fill', 'white');

    var legendData = ['Term Rejected', 'Term Subscriped'];
    var legend = svg.append('g')
        .attr('class', 'node')
        .attr('transform', 'translate(' + (-width / 2) + ',' + (height - 50) + ')')
        .selectAll('g')
        .data(legendData)
        .enter().append('g')
        .attr('transform', function (d, i) { return 'translate(' + (i * 150 - 150) + ',0)'; });

    legend.append('rect')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .attr('x', width + 24)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', function (d, i) {
            return d3.schemeCategory10[i];
        });

    legend.append('text')
        .attr('x', width + 50)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(function (d) { return d; });

    div = d3.select('.toolTip');
    d3.selectAll('circle,text').on('mousemove', function (d, i) {
        div.style('left', d3.event.pageX + 10 + 'px');
        div.style('top', d3.event.pageY + 10 + 'px');
        if (displayToolTip) {
            div.style('display', 'inline-block');
        }
        else {
            div.style('display', 'none');
        }
        div.html('Number of people in this category: ' + (d['data']['value']) + '<br>' + 'Proportion: ' + Number(d['data']['value'] / total * 100).toFixed(0) + '%');
    })

    d3.selectAll('circle, text').on('mouseout', function (d) {
        div.style('display', 'none');
    });
}


function UpdatePie() {
    d3.select('#canvas_page2').selectAll('*').remove();
    var canvasContainer = d3.select('#canvas_page2').node();
    var width = canvasContainer.getBoundingClientRect().width;
    var height = canvasContainer.getBoundingClientRect().height;
    var margin = 40;
    var transition_duration = dashboardAnimated ? 500 : 0;
    var svg = d3.select('#canvas_page2').append('svg').attr('width', width).attr('height', height);
    var g = svg.append('g').attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
    var data = [{ 'text_desc': 'Term Subscription Accepted', 'number': 514 }, { 'text_desc': 'Term Subscription Rejected', 'number': 3969 }];
    var total = 0;
    for (var i = 0; i < data.length; i++) {
        total += data[i]['number'];
    }

    var arc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2 - 2 * margin);
    var pie = d3.pie().value(function (d) { return d['number']; }).sort(null);

    var g = g.selectAll('path').data(pie(data)).enter().append('g');

    g.append('path').attr('fill', function (d, i) {
        return d3.schemeCategory10[Math.abs(1 - i)];
    }).transition().delay(function (d, i) {
        return i * transition_duration;
    }).duration(transition_duration)
        .attrTween('d', function (d) {
            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    g.append('text')
        .attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; })
        .attr('fill', 'white')
        .transition()
        .delay(data.length * transition_duration)
        .text(function (d) { return d.data['number']; });

    var legendData = ['Term Rejected', 'Term Subscriped'];
    var legend = svg.append('g')
        .attr('class', 'node')
        .attr('transform', 'translate(' + (-width / 2) + ',' + (height - 50) + ')')
        .selectAll('g')
        .data(legendData)
        .enter().append('g')
        .attr('transform', function (d, i) { return 'translate(' + (i * 150 - 150) + ',0)'; });

    legend.append('rect')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .attr('x', width + 24)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', function (d, i) {
            return d3.schemeCategory10[i];
        });

    legend.append('text')
        .attr('x', width + 50)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text(function (d) { return d; });

    div = d3.select('.toolTip');
    d3.selectAll('path').on('mousemove', function (d, i) {
        div.style('left', d3.event.pageX + 10 + 'px');
        div.style('top', d3.event.pageY + 10 + 'px');
        if (displayToolTip) {
            div.style('display', 'inline-block');
        }
        else {
            div.style('display', 'none');
        }
        div.html(d.data['text_desc'] + ': ' + (d.data['number']) + '<br>' + 'Proportion: ' + Number(d.data['number'] / total * 100).toFixed(0) + '%');
        svg.selectAll('path').attr('stroke', 'none');
        d3.select(this).attr('stroke', 'black');
    })

    d3.selectAll('path').on('mouseout', function (d) {
        div.style('display', 'none');
        svg.selectAll('path').attr('stroke', 'none');
    });
}