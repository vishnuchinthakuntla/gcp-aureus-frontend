import { useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React from 'react';
import useAgentStore from '../../stores/useAgentStore';
import './Charts.css';

/*
export const initialTrendData = [
    { name: 'P1', y: 0, color: '#F43F5E' },
    { name: 'P2', y: 0, color: '#F5A524' },
];

export const sampleTrendData = {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
        { name: 'P1', data: [3, 2, 4, 1, 5, 2, 3] },
        { name: 'P2', data: [5, 4, 6, 3, 7, 4, 5] },
        { name: 'P3', data: [8, 7, 9, 6, 10, 8, 7] },
        { name: 'P4', data: [2, 3, 1, 4, 2, 3, 2] },
    ],
};
*/

/** Build { categories, series } for the last-7-days bar chart from raw tickets. */
function buildTrendData(tickets) {
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];

    // Build an array of the last 7 dates (oldest → newest)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i)); // 6 days ago → today
        return d;
    });

    const categories = days.map(d => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`);

    // Initialise counts: { P1: [0,0,0,0,0,0,0], P2: [...], ... }
    const counts = Object.fromEntries(PRIORITIES.map(p => [p, new Array(7).fill(0)]));

    (tickets || []).forEach(t => {
        const prio = t.severity || 'P3';
        if (!counts[prio]) return; // ignore unknown priorities

        const created = new Date(t.created_at);
        created.setHours(0, 0, 0, 0);

        // Find which bucket (0-6) this ticket falls into
        const diffMs = created.getTime() - days[0].getTime();
        const idx = Math.floor(diffMs / 86400000); // ms → days
        if (idx >= 0 && idx < 7) counts[prio][idx]++;
    });

    return {
        categories,
        series: PRIORITIES.map(p => ({ name: p, data: counts[p] })),
    };
}

function Charts() {
    const ticketStats = useAgentStore(s => s.header.tickets)
    const ticketsData = useAgentStore(s => s.header.ticketsData)
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);

    const pieChartData = [
        { name: 'P1', y: ticketStats.P1, color: '#F43F5E' },
        { name: 'P2', y: ticketStats.P2, color: '#F5A524' },
    ]

    const trendData = buildTrendData(ticketsData);

    const barOptions = {
        chart: { type: 'column', backgroundColor: 'transparent', borderRadius: 10, style: { fontFamily: 'DM Sans,sans-serif' } },
        title: { text: '' },
        xAxis: {
            categories: trendData?.categories || [],
            labels: { style: { color: '#64748B', fontSize: '11px' } },
            lineColor: 'rgba(14,23,38,0.06)', tickColor: 'transparent', gridLineColor: 'transparent',
        },
        yAxis: {
            min: 0, title: { text: 'Tickets', style: { color: '#64748B' } },
            labels: { style: { color: '#64748B' } }, gridLineColor: 'rgba(14,23,38,0.06)',
        },
        legend: { enabled: true, itemStyle: { color: '#64748B', fontSize: '11px', fontWeight: '500' } },
        colors: ['#F43F5E', '#F5A524', '#4F8EF7', '#10D9A0'],
        series: (trendData?.series || []).map((s) => ({ type: 'column', name: s.name, data: s.data })),
        plotOptions: { column: { stacking: 'normal', borderWidth: 0, borderRadius: 5 } },
        credits: { enabled: false },
    };

    const pieOptions = {
        chart: { type: 'pie', backgroundColor: 'transparent', borderRadius: 10, style: { fontFamily: 'DM Sans,sans-serif' } },
        title: { text: '' },
        plotOptions: {
            pie: {
                innerSize: '58%', borderWidth: 2, borderColor: '#F4F7FD',
                dataLabels: { enabled: true, style: { color: '#94A3B8', textOutline: 'none', fontSize: '11px', fontWeight: '600' } },
                slicedOffset: 5,
            },
        },
        series: [{ type: 'pie', name: 'Tickets', data: pieChartData.map((d) => ({ name: d.name, y: d.y, color: d.color })) }],
        credits: { enabled: false },
    };

    return (
        <div className="charts-row">
            <div className="chart-box">
                <h3>TICKETS - Last 7 Days</h3>
                <HighchartsReact highcharts={Highcharts} options={barOptions} ref={barChartRef} />
            </div>
            <div className="chart-box">
                <h3>Open Ticket (P1–P4)</h3>
                <HighchartsReact highcharts={Highcharts} options={pieOptions} ref={pieChartRef} />
            </div>
        </div>
    );
}

export default React.memo(Charts);
