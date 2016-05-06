app = angular.module('data',[]);

app.config(['$httpProvider', '$interpolateProvider', function($httpProvider, $interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

app.factory('DataService', ['$http','$window',function($http,$window) {

    var service = {
        'quantities': [
            {
                key: 'magnitude',
                text: 'Magnitude'
            },
            {
                key: 'frequency',
                text: 'Frequenz'
            },
            {
                key: 'counts',
                text: 'Counts'
            },
            {
                key: 'period',
                text: 'Periode'
            },
            {
                key: 'temperature',
                text: 'Temperatur'
            }
        ]
    };

    var urls = {
        'locations': '/api/locations/',
        'measurements': '/api/measurements/',
    };

    function getDate() {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        date.setHours(18, 0, 0);
        return date;
    }

    function getMin(data, key) {
        return data.reduce(function(prev, curr) {
            return prev[key] < curr[key] ? prev : curr;
        })[key];
    }

    function getMax(data, key) {
        return data.reduce(function(prev, curr) {
            return prev[key] > curr[key] ? prev : curr;
        })[key];
    }

    service.init = function() {
        service.date = getDate();
        service.quantity = 'magnitude';

        // fetch locations
        $http.get(urls.locations).success(function(response) {
            service.locations = response;
            service.location = service.locations[0];

            service.fetchMeasurements();
        });
    };

    service.fetchMeasurements = function() {
        var before = angular.copy(service.date);
        before.setDate(before.getDate() + 1);
        before.setHours(8, 0, 0);

        var config = {
            params: {
                location: service.location.slug,
                after: service.date,
                before: before
            }
        };

        $http.get(urls.measurements, config).success(function(response) {
            service.measurements = response;

            service.drawPlot();
        });
    };

    service.drawPlot = function() {

        d3.selectAll("svg > *").remove();

        var data = service.measurements,
            key = service.quantity;

        if (data.length === 0) return;

        var margin = {top: 10, right: 10, bottom: 30, left: 50},
            width = 640 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        var xMin = new Date(getMin(data, 'timestamp')),
            xMax = new Date(getMax(data, 'timestamp')),
            yMin = Math.ceil(getMax(data, key)),
            yMax = getMin(data, key);

        var xScale = d3.time.scale.utc().domain([xMin, xMax]).range([0, width]),
            yScale = d3.scale.linear().domain([yMin, yMax]).range([height, 0]);

        var xTicks = d3.time.hours,
            xTickFormat = d3.time.format('%H:00');

        var xAxis = d3.svg.axis().scale(xScale)
                        .orient('bottom')
                        .ticks(xTicks)
                        .tickFormat(xTickFormat),
            yAxis = d3.svg.axis().scale(yScale)
                        .orient('left');

        d3.selectAll("svg > *").remove();

        var svg = d3.select('#plot')
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append('g').call(xAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')');
        svg.append('g').call(yAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0, 0)');

        var line = d3.svg.line()
            .x(function (d) { return xScale(new Date(d.timestamp)); })
            .y(function (d) { return yScale(d[key]); })
            .interpolate('basis');

        svg.append('g').append("path")
            .attr("d", line(data))
            .attr('class', 'data');
    };

    return service;
}]);

app.controller('DataController', ['$scope','DataService',function($scope, DataService) {

    $scope.service = DataService;
    $scope.service.init();

}]);
