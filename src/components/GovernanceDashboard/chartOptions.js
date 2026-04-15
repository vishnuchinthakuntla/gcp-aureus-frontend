import { start } from "highcharts";


export const confidenceOptions = {
  chart: {
    type: 'column',
    backgroundColor: 'transparent',
    height: 120
  },
  title: { text: undefined },
  xAxis: {
    categories: ['>90%', '80-90%', '70-80%', '60-70%', '50-60%', '<50%'],
    labels: {
      style: { fontSize: '10px', color: '#7a8ea8' }
    },
    lineColor: '#e2e8f0',
    tickLength: 0,
    min: 0,
    // gridLineColor: '#e2e8f0'
  },
  yAxis: {
    title: { text: null },
    min: 0,
    tickInterval: 2,
    // gridLineColor: '#e2e8f0',
    lineColor: '#e2e8f0',
    lineWidth: 1,
    labels: {
      style: { fontSize: '10px', color: '#7a8ea8' }
    }
  },
  plotOptions: {
    column: {
      borderRadius: 3,
      borderWidth: 2,
      color: 'rgba(125, 211, 252, 0.7)',
      borderColor: '#7dd3fc',
      pointPadding: 0.15,
      groupPadding: 0.1
    }
  },
  legend: { enabled: false },
  credits: { enabled: false },
  series: [{
    name: 'Confidence',
    data: [6, 0, 0, 0, 0, 0]
  }],
  tooltip: {
    pointFormat: '<b>{point.y}</b> tickets'
  }
};

export const failurePatternsOptions = {
  chart: {
    type: 'bar',
    backgroundColor: 'transparent',
    height: 200
  },
  title: { text: undefined },
  xAxis: {
    categories: ['FILE AVAILABILITY', 'SCHEMA CHANGE'],
    title: { text: null },
    labels: {
      style: {
        fontSize: '11px',
        color: '#3d5278'
      }
    },
    lineColor: '#e2e8f0'
  },
  yAxis: {
    title: { text: null },
    min: 0,
    allowDecimals: false,
    lineColor: '#e2e8f0',
    lineWidth: 1,
    // gridLineColor: '#e2e8f0',
    labels: {
      style: { fontSize: '10px', color: '#7a8ea8' }
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 3,
      borderWidth: 1.5,
      borderColor: '#8b5cf6',
      color: 'rgba(139, 92, 246, 0.15)',
      pointPadding: 0.15,
      groupPadding: 0.1,
      dataLabels: {
        enabled: false
      }
    }
  },
  legend: { enabled: false },
  credits: { enabled: false },
  series: [{
    name: 'Patterns',
    data: [5, 2]
  }],
  tooltip: {
    pointFormat: '<b>{point.y}</b> occurrences'
  }
};


export const agentPerformanceOptions = {
  chart: {
    polar: true,
    backgroundColor: 'transparent',
    margin: [5, 5, 5, 5],
    height: 170,
    width: 170,
  },
  title: { text: undefined },
  credits: { enabled: false },
  pane: {
    size: '55%',
    startAngle: -36,
    endAngle: 324
  },
  xAxis: {
    categories: ['Accuracy', 'Speed', 'Coverage', 'Recovery', 'Uptime'],
    tickmarkPlacement: 'on',
    lineWidth: 0,
    labels: {
      distance: 5,
      formatter: function () {
        const adjustUp = {
            'Accuracy': -5,
            'Uptime': -5,
            'Speed': -5,
        };
        const offset = adjustUp[this.value] ?? 0;
        return `<span style="position:relative; top:${offset}px; font-size:9px; color:#7a8ea8; font-weight:500">${this.value}</span>`;
        },
      useHTML: true,
      style: {
        fontSize: '9px',
        color: '#7a8ea8',
        fontWeight: '500'
      }
    }
  },
  yAxis: {
    gridLineInterpolation: 'polygon',
    lineWidth: 0,
    min: 0,
    max: 100,
    tickInterval: 10,
    labels: {
      format: '{value}%',
      style: { fontSize: '8px', color: '#7a8ea8' }
    },
    gridLineColor: '#e8edf5',
    gridLineWidth: 1
  },
  tooltip: {
    shared: true,
    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}%</b><br/>'
  },
  legend: { enabled: false },
  plotOptions: {
    line: {
      lineWidth: 1.5,
      marker: {
        radius: 3,
        symbol: 'circle'
      },
      dataLabels: { enabled: false }
    }
  },
  series: [
    {
      type: 'line',
      name: 'Observer',
      data: [99, 97, 95, 90, 99],
      color: '#0284c7',
      fillOpacity: 0.07,
      marker: { fillColor: '#0284c7' }
    },
    {
      type: 'line',
      name: 'RCA',
      data: [92, 88, 90, 85, 96],
      color: '#b45309',
      fillOpacity: 0.06,
      marker: { fillColor: '#b45309' }
    },
    {
      type: 'line',
      name: 'Decision',
      data: [94, 91, 88, 92, 97],
      color: '#6d28d9',
      fillOpacity: 0.05,
      marker: { fillColor: '#6d28d9' }
    },
    {
      type: 'line',
      name: 'Healing',
      data: [95, 93, 91, 96, 98],
      color: '#047857',
      fillOpacity: 0.06,
      marker: { fillColor: '#047857' }
    }
  ]
};

export const knowledgeGrowthOptions = {
  chart: {
    type: 'area',
    height: '200px',
  },
  title: {
    text: null,
  },
  credits: {enabled: false},
  xAxis: {
    categories: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
    tickStart: 0,
    tickInterval: 1,
  },
  yAxis: [
    {
      title: { text: 'Patterns / Rules' },
      min: 170,
      max: 220,
      tickStart: 170,
      tickInterval: 10,
      gridLineWidth: 1,
      gridLineColor: '#e8edf5',
    },
    {
      title: { text: '% Auto-resolve' },
      opposite: true,
      labels: { format: '{value}%' },
      min: 45,
      max: 65,
      tickInterval: 5,
    },
  ],
  legend: {
    align: 'center',
    verticalAlign: 'top',
    layout: 'horizontal',
    y: -15,
  },
  plotOptions: {
    area: {
      fillOpacity: 0.01,
      marker: { radius: 4 },
    },
  },
  series: [
    {
      name: 'Failure Patterns',
      data: [170, 175, 180, 190, 195, 200, 210, 215],
      color: '#8B5CF6',
      fillColor: 'rgba(139, 92, 246, 0.1)',
      pointPlacement: 'on'
    },
    {
      name: 'Diagnostic Rules',
      data: [168, 182, 178, 192, 198, 208, 215, 220],
      color: '#3B82F6',
      fillColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      name: 'Auto-resolve %',
      type: 'line',           // plain line, no area fill
      dashStyle: 'Dash',      // dashed line
      data: [50, 52, 54, 55, 56, 58, 60, 61],
      color: '#F97316',
      yAxis: 1,               // maps to the right-side axis
      marker: { radius: 3 },
    },
  ],
};



// Separate coverage card (not a gauge, just text)
const coverageOptions = {
  chart: {
    type: 'pie',
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Coverage',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      fontSize: '12px',
      fontWeight: 'bold'
    }
  },
  plotOptions: {
    pie: {
      innerSize: '60%',
      dataLabels: {
        enabled: true,
        format: '{point.y} agents',
        style: {
          fontSize: '12px',
          fontWeight: 'bold'
        }
      },
      showInLegend: false
    }
  },
  series: [{
    name: 'Coverage',
    data: [{ name: 'Active', y: 4, color: '#2196F3' }],
    size: '40%',
    center: ['50%', '50%']
  }],
  tooltip: {
    enabled: false
  }
};