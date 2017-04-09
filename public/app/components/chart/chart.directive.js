import Injectable from 'utils/injectable';
import Chart from 'chart.js';

class ChartComponent extends Injectable {
  constructor(...injections) {
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
  link(scope, element) {
    let defaultColors = [
      '#9ac2e5',
      '#4684c1',
      '#96c483',
      '#389978',
      '#70cdd4',
      '#227692',
      '#7174ab',
      '#2c4a6e'
    ];

    let redrawChart = () => {
      if(scope.chart) scope.chart.destroy();
      scope.chart = new Chart(element[0].querySelector('canvas'), {
        type: scope.type,
        data: {
          labels: scope.labels,
          datasets: [{
            data: scope.chartData,
            backgroundColor: scope.colors || defaultColors,
            hoverBackgroundColor: scope.colors || defaultColors
          }]
        },
        options: scope.options
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
ChartComponent.$inject = ['$compile'];

export default ChartComponent;
