import Injectable from 'utils/injectable';
import Chart from 'chart.js';

class ChartComponent extends Injectable {
  constructor (...injections) {
    super(ChartComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {
      type: '=',
      chartData: '=',
      labels: '=',
      colors: '=',
      options: '='
    };
    this.template = '<div class="chart"><canvas></canvas></div>';
  }

  link (scope, element) {
    const redrawChart = _ => {
      if (scope.chart) {
        scope.chart.destroy();
      }

      scope.chart = new Chart(element[0].querySelector('canvas'), {
        data: {
          datasets: [{
            backgroundColor: scope.colors || this.ChartColours,
            data: scope.chartData,
            hoverBackgroundColor: scope.colors || this.ChartColours
          }],
          labels: scope.labels
        },
        options: scope.options,
        type: scope.type
      });
    };

    scope.$watch('chartData', redrawChart);
    scope.$watch('labels', redrawChart);
    scope.$watch('colors', redrawChart);
    scope.$watch('options', redrawChart);
    scope.$watch('type', redrawChart);
    redrawChart();
  }
}

ChartComponent.$inject = [
  '$compile',
  'ChartColours'
];

export default ChartComponent;
