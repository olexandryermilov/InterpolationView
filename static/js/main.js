var color_red = '#FF0000';
var color_green = '#00FF00';
var formula = $('#formula').val();
var left_bound = parseFloat($('#left_bound').val());
var right_bound = parseFloat($('#right_bound').val());
var points = 200;

window.onload = function () {
    var ctx = document.getElementById('main-canvas').getContext('2d');
    window.chart = new Chart(ctx, config);
    var f1 = 'x^2 + sin(9*x) + cos(4*x)*1.6 + 24*exp(-x^2)';
    refresh_formula();
};

function refresh_formula() {
    formula = $('#formula').val();
    left_bound = parseFloat($('#left_bound').val());
    right_bound = parseFloat($('#right_bound').val());
    clear_charts();
    draw_function(formula, 'Formula', '#00FF00');
}

function clear_charts() {
    config.data.datasets = [{},{},{}];
    chart.update();
}

function draw_function(func, name, color) {
    var dataset = {
        label: name,
        backgroundColor: color || '#000000',
        borderColor: color || '#000000',
        radius: 0,
        data: [],
        fill: false
    };
    var max = -1e9;
    var min = 1e9;
    for (var i = 0; i <= points; i++) {
        var x = (right_bound-left_bound)*i/points + left_bound;
        var y = math.eval(func, {x: x});
        max = Math.max(max, y);
        min = Math.min(min, y);
        dataset.data.push({x: x, y: y});
    }
    var s = (max-min) * 0.1;
    max += s;
    min -= s;
    console.log(config.options);
    config.options.scales.yAxes[0].ticks.min = min;
    config.options.scales.yAxes[0].ticks.max = max;
    config.options.scales.xAxes[0].ticks.min = Math.min(left_bound, right_bound);
    config.options.scales.xAxes[0].ticks.max = Math.max(left_bound, right_bound);
    config.data.datasets[2] = dataset;
    chart.update();
}

function draw_interpolation(xs, ys, name, color) {
    var dataset = {
        label: name,
        backgroundColor: color || '#000000',
        borderColor: color || '#000000',
        radius: 0,
        data: [],
        fill: false
    };
    for (var i = 0; i <= xs.length; i++) {
        dataset.data.push({x: xs[i], y: ys[i]});
    }
    config.data.datasets[1] = dataset;
    chart.update();
}

function draw_points(xs, ys, name, color) {
    var dataset = {
        label: name,
        backgroundColor: color || '#000000',
        borderColor: color || '#000000',
        pointRadius: 3,
        data: [],
        fill: false,
        showLine: false
    };
    for (var i = 0; i <= xs.length; i++) {
        dataset.data.push({x: xs[i], y: ys[i]});
    }
    config.data.datasets[0] = dataset;
    chart.update();
}

$('#left_bound').change(function(){refresh_formula();});
$('#right_bound').change(function(){refresh_formula();});
$('#formula').change(function(){refresh_formula();});

function log(ok, message) {
    if (ok) {
        $('#log').prepend('[OK] ' + message + '<br>')
    } else {
        $('#log').prepend('[ERROR] ' + message + '<br>')
    }
}

function lagrange_interpolation(x, y) {
    draw_points(x, y, 'Points', '#FF0000');
    draw_interpolation([],[]);
    $.get(
        "/lagrange_interpolation_values",
        {
            x: x,
            y: y,
            left: left_bound,
            right: right_bound,
            points: points
        },
        function( data ) {
            if (data.ok) {
                draw_interpolation(data.x, data.y, 'Lagrange polynomial', '#FF0000');
                log(data.ok, data.polynomial);
            } else {
                log(data.ok, data.message);
            }
        }
    );
}

function lagrange_interpolation_any() {
    var x = $('#x').val().split(',').map(function(item) {
        return parseFloat(item);
    });
    var y = [];
    x.forEach(function(x){y.push(math.eval(formula, {x:x}));});
    lagrange_interpolation(x,y);
}

function lagrange_interpolation_same() {
    var left = parseFloat($('#left').val());
    var right = parseFloat($('#right').val());
    var intervals = parseInt($('#intervals').val());
    var x = [];
    for (var i = 0; i <= intervals; i++) x.push((right-left)*i/intervals + left);
    var y = [];
    x.forEach(function(x){y.push(math.eval(formula, {x:x}));});
    lagrange_interpolation(x,y);
}

function lagrange_interpolation_chebyshev() {
    var left = parseFloat($('#left_c').val());
    var right = parseFloat($('#right_c').val());
    var intervals = parseInt($('#intervals_c').val());
    var x = [];
    for (var i = 0; i <= intervals; i++) {
		var t = Math.cos((2*i+1)*Math.PI/(2*intervals+2));
		x.push((right+left)/2 + (right-left)*t/2);
	}
    var y = [];
    x.forEach(function(x){y.push(math.eval(formula, {x:x}));});
    lagrange_interpolation(x,y);
}

var config = {
    type: 'line',
    data: {
        datasets: []
    },
    options: {
        responsive: true,
        title: {
            display: false,
            text: 'Interpolation Viewer'
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: true,
                type: 'linear',
                position: 'bottom',
                ticks: {
                    min: -5,
                    max: 0
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                },
                ticks: {
                    min: -5,
                    max: 0
                }
            }]
        }
    }
};