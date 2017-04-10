//configuration object

var config = {
    title:"Madagascar 3W 2017",
    description: "<p>Click the graphs or map to interact.<br />Date: April 2017.<br />Contacts: <a href='https://twitter.com/Simon_B_Johnson' target='_blank'>Simon Johnson</a>, <a href='https://twitter.com/zibethin</p>' target='_blank'>Thuong Nguyen</a></p>",
    data: "data/data2.json",
        //"https://proxy.hxlstandard.org/data.json?url=https%3A//docs.google.com/spreadsheets/d/1eJjAvrAMFLpO3TcXZYcXXc-_HVuHLL-iQUULV60lr1g/edit%23gid%3D0&strip-headers=on", //"data/data.json",
    whoFieldName:"#org",
    whatFieldName:"#sector",
    whereFieldName:"#adm3+code",
    statusFieldName:"#status",
    geo:"data/mdgAdm3.json",
    joinAttribute:"P_CODE",
    colors:['#ef8f8f','#9a181a','#841517','#ef8f8f','#6e1113','#580e0f','#420a0b','#2c0708']
};

// hxlProxyToJSON: reading hxl tags and setting them as keys for each event
// input is an array with hxl tags as first object, and then the data as objects
// output is an array with hxl tags as keys for the data objects

function hxlProxyToJSON(input) {
    var output = [];
    var keys = []
    input.forEach(function (e, i) {
        if (i == 0) {
            e.forEach(function (e2, i2) {
                var parts = e2.split('+');
                var key = parts[0]
                if (parts.length > 1) {
                    var atts = parts.splice(1, parts.length);
                    atts.sort();
                    atts.forEach(function (att) {
                        key += '+' + att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function (e2, i2) {
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

//function to generate the 3W component
//data is the whole 3W Excel data set
//geom is geojson file

function generate3WComponent(config,data,geom){    
    
    $('#title').html(config.title);
    $('#description').html(config.description);

    var whoChart = dc.rowChart('#hdx-3W-who');
    var whatChart = dc.rowChart('#hdx-3W-what');
    var whereChart = dc.leafletChoroplethChart('#hdx-3W-where');
    var statusChart = dc.rowChart('#hdx-3W-status');

    var cf = crossfilter(data);

    var whoDimension = cf.dimension(function(d){ return d[config.whoFieldName]; });
    var whatDimension = cf.dimension(function(d){ return d[config.whatFieldName]; });
    var whereDimension = cf.dimension(function(d){ return d[config.whereFieldName]; });
    var statusDimension = cf.dimension(function(d){ return d[config.statusFieldName]; });
    var whoGroup = whoDimension.group();
    var whatGroup = whatDimension.group();
    var whereGroup = whereDimension.group();
    var statusGroup = statusDimension.group();
    var all = cf.groupAll();

    whoChart.width($('#hdx-3W-who').width()).height(200)
            .dimension(whoDimension)
            .group(whoGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(20);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);

    whatChart.width($('#hdx-3W-what').width()).height(200)
            .dimension(whatDimension)
            .group(whatGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);
    
    statusChart.width($('#hdx-3W-status').width()).height(150)
            .dimension(statusDimension)
            .group(statusGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })    
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5); 

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);

    whereChart.width($('#hxd-3W-where').width()).height(250)
            .dimension(whereDimension)
            .group(whereGroup)
            .center([-15.623037, 48.702393])//[6.9167,150.1833])
            .zoom(6)    
            .geojson(geom)
            .colors(['#CCCCCC', config.colors[3]])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                if(d>0){
                    return 1;
                } else {
                    return 0;
                }
            })           
            .featureKeyAccessor(function (feature) {
                return (feature.properties[(config.joinAttribute)]);
            });
            
        dc.dataTable("#data-table")
                .dimension(whatDimension)                
                .group(function (d) {
                    return d[config.whatFieldName];
                })
                .size(650) //number of lines
                .columns([ //#org, #adm1+name, #adm2+name #adm3+name #adm4+name, #status, #sector+subsector #activity+type #targeted #reached
                    function (d) {
                       return d['#org']; 
                    },
                    function(d){
                       return d['#adm1+name']; 
                    },
                    function(d){
                       return d['#adm2+name'];
                    },
                    function(d){
                       return d['#adm3+name'];
                    },
                    function(d){
                       return d['#adm4+name']; 
                    },
                    function(d){
                       return d['#status']; 
                    },
                    function(d){
                        return d['#sector+subsector']; 
                    },
                    function(d){
                        return d['#activity+type']; 
                    },
                    function(d){
                        return d['#targeted']; 
                    },
                    function(d){
                        return d['#reached']; 
                    }
                ])
                .renderlet(function (table) {
                    table.selectAll(".dc-table-group").classed("info", true);
                });            
                                
    dc.renderAll();
    
    var g = d3.selectAll('#hdx-3W-who').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-who').width()/2)
        .attr('y', 200)
        .text('Activites');

    var g = d3.selectAll('#hdx-3W-what').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-what').width()/2)
        .attr('y', 200)
        .text('Activites');

    var g = d3.selectAll('#hdx-3W-status').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-status').width()/2)
        .attr('y', 150)
        .text('Activites');

}

//load 3W data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: config.data, 
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: config.geo, 
    dataType: 'json'
});

//when both ready construct 3W
$.when(dataCall, geomCall).then(function (dataArgs, geomArgs) {
    dataArgs[0] = hxlProxyToJSON(dataArgs[0]);
    var geom = topojson.feature(geomArgs[0], geomArgs[0].objects.mdgAdm3);
    //converts place codes to string
    geom.features.forEach(function(e){
        e.properties[config.joinAttribute] = String(e.properties[config.joinAttribute]);
    });
    generate3WComponent(config,dataArgs[0],geom);
});

