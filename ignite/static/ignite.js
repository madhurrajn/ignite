  angular.module('ignite', ['angularjs-dropdown-multiselect'])
  .controller('FetchController', [
    '$scope',
    '$rootScope',
    '$http',
    function($scope, $rootScope,$http){
        console.log($scope);

        $scope.post_to_server = function(caller, data, callback){
            $scope.method = 'POST';
            $scope.code = null;
            $scope.response = null;
            $scope.url = '/ignite/'
            var csrftoken = $scope.getCookie('csrftoken')

            $http({method:$scope.method, 
                    url:$scope.url,
                    headers:{'Content-Type':'application/x-www-form-urlencoded'},
                    data:"function="+caller+"&data="+data+"&csrfmiddlewaretoken="+csrftoken
                   }).
                then(function(response){
                    $scope.status = response.status;
                    $rootScope.status = response.status;
                    $scope.data = response.data;
                    callback(response.data);
                }, function(response){
                    $scope.status = response.status;
                    $scope.data = response.data || "Request Failed";
                });

        };

        $scope.fetch_graph_data_callback = function(data){
            console.log(data);
            buildChart(data['sched_list'])
        };

        $scope.fetch_headers_callback = function(data){
                $scope.featureOptions = data['sched_list']
                $scope.featureMap = {};
                _.each($scope.featureOptions, function(val) {
                                $scope.featureMap[val.id] = val;
                                });
                console.log(data);
        };

        $scope.fetch_headers = function() {
            response_data = $scope.post_to_server("fetch_headers", "", $scope.fetch_headers_callback);
            console.log(response_data);
        };


        $scope.fetch = function(url, orig_lat, orig_lng, dest_lat, dest_lng, method) {
            var localtime = moment().utcOffset();
            $scope.method = 'POST';
            $scope.code = null;
            $scope.response = null;
            $scope.url = '/ignite/'
            var csrftoken = $scope.getCookie('csrftoken')


            $http({method:$scope.method, 
                    url:$scope.url,
                    headers:{'Content-Type':'application/x-www-form-urlencoded'},
                    data:"localtime="+localtime+"&csrfmiddlewaretoken="+csrftoken
                   }).
                then(function(response){
                    $scope.status = response.status;
                    $rootScope.status = response.status;
                    $scope.data = response.data;
                    $scope.sched_lists = response.data.sched_list;
                    buildChart($scope.sched_lists);
                    buildGuage($scope.sched_lists);
                    $scope.sched_lists.forEach(function(elem){
                        console.log(elem)
                    });
                }, function(response){
                    $scope.status = response.status;
                    $scope.data = response.data || "Request Failed";
                });
        };

    $scope.updateModel = function(method, url){
        $scope.method = method;
        $scope.url = url;
    };

    $scope.getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };




    $scope.duration_list = [
        {'value': '2 Hours'},
        {'value': '4 Hours'},
        {'value': '6 Hours'},
        {'value': '8 Hours'},
        {'value': '10 Hours'},
        {'value': '24 Hours'},
        {'value': 'Week'},
    ];

    var buildGuage = function(sched_list){
        var min_val = 0;
        var max_val = 0;
        var cur_val = 0;
        min_duration = _.pluck(sched_list, 'min_duration');
        max_duration = _.pluck(sched_list, 'max_duration');
        cur_duration = _.pluck(sched_list, 'cur_duration');
        for (var i=0; i<min_duration.length; i++){
            if(min_duration[i] != undefined){
                min_val = min_duration[i]
            }
        }
        for (var i=0; i<max_duration.length; i++){
            if(max_duration[i] != undefined){
                max_val = max_duration[i]
            }
        }
        for (var i=0; i<cur_duration.length; i++){
            if(cur_duration[i] != undefined){
                cur_val = cur_duration[i]
            }
        }
        google.charts.setOnLoadCallback(drawChart);
        function drawChart(){
            cur_val = parseInt(cur_val);
            var data = google.visualization.arrayToDataTable([
                ['Label', 'Value'],
                ['Now', cur_val]
            ]);
            min_val = parseInt(min_val)
            max_val = parseInt(max_val)
            var variance = max_val - min_val;
            var variance_segment = variance/3;
            var red_from = min_val + (variance * 2 / 3)
            var red_to = max_val
            var yellow_from = min_val + (variance / 3)
            var yellow_to = min_val + (variance * 2 / 3)
            var options = {
                width: 400, height: 120,
                redFrom: red_from, redTo:red_to,
                yellowFrom : yellow_from, yellowTo: yellow_to,
                min: min_val, max: max_val,
                minorTicks: 5
            };
            var chart = new google.visualization.Gauge(document.getElementById('guage_chart'))
            chart.draw(data, options);
            setInterval(function() {
              data.setValue(0, 1, cur_val);
              chart.draw(data, options);
            }, 1000);
        };
    };
    var buildChart = function(sched_list){
        var Series = []
        var series_elem = []
        _.each(_.keys(sched_list), function(k){
            series_elem.push({
                "name":k,
                "data":_.pluck(JSON.parse(sched_list[k]), 'count'), 
                "color":'#'+(Math.random()*0xFFFFFF<<0).toString(16)
            })
        });
        time_list = _.pluck(sched_list[0], 'week');
        duration_list = [];
        date_list = [];
        for (var i=0;i<time_list.length; i++){
            time_list[i] = parseInt(time_list[i]);
            console.log(time_list[i]);
        }
        //for (var i=0; i<duration_list_1.length; i++){
         //   console.log(duration_list_1[i]);
          //  duration_list.push(duration_list_1[i]);
           // date_list.push(date_list_1[i]);
        //}
        console.log(time_list);
        console.log(Series);
        $('#chartContainer').highcharts({
            chart: {
                renderTo: 'schedChartContainer',
                type: 'line',
            },  
            title: {
                text: 'Estimated Time'
            },  
            xAxis: {
                type:'datetime',
                categories: date_list
            },  
            yAxis: {
                min: 0,
                title: {
                    text: 'Parameter'
                }   
            },  
            tooltip: {
                formatter: function() {
                    if (this.percentage === 0) return null;
                    return '<b>' + this.x + '</b><br/>' + this.series.name + ': ' + this.y + '<br/>'
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                },  
                series: {
                    pointWidth: 20
                }
            },
            series: series_elem,
            loading: false
        });
    };
    $scope.isSchedSet = function(){
        if ($scope.sched_lists){
            return true;
        }
        else
            return false;
    };

    $scope.analyse = function(){
        var feature_str = [] 
        $scope.featuremodel.forEach(function(entry){
            feature_str += $scope.featureMap[entry.id].label +","
        });
        console.log(feature_str)
        response_data = $scope.post_to_server("fetch_graph_data", feature_str, $scope.fetch_graph_data_callback);
    }

    

    $scope.fromdate = "From"
    $scope.todate = "To"
    $scope.fetch_headers();
    $scope.featureoptions = "Loading..."

   $scope.featuremodel = [];
   $scope.featureOptions = [];

    $scope.featuresettings = {
       scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true,
      smartButtonMaxItems: 3,
      smartButtonTextConverter: function(itemText, originalItem) {
        if (itemText === 'Jhon') {
          return 'Jhonny!';
        }

        return itemText;
      }
    };

}]);
