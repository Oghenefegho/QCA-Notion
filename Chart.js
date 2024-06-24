// Function to create and render the chart
function createChart() {
    const chartData = prepareChartData();

    const ctx = document.getElementById('grades-chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Average Grade',
                data: chartData.data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Semester'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Average Grade'
                    }
                }
            }
        }
    });
}

// Call createChart() function to render the chart
createChart();
