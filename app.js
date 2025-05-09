// app.js

// Initialize charts
let btcPriceChart, portfolioGrowthChart;

// Fetch current BTC price
async function fetchBTCPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        document.getElementById('btc-price').textContent = `$${data.bitcoin.usd.toLocaleString()}`;
        return data.bitcoin.usd;
    } catch (error) {
        console.error("Error fetching BTC price:", error);
    }
}

// Fetch historical data
async function fetchHistoricalData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30');
        const data = await response.json();
        processChartData(data.prices);
    } catch (error) {
        console.error("Error fetching historical data:", error);
    }
}

// Process chart data
function processChartData(prices) {
    const labels = prices.map(price => 
        new Date(price[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    const btcPrices = prices.map(price => price[1]);
    createBTCPriceChart(labels, btcPrices);
    createPortfolioGrowthChart(labels, btcPrices);
}

// Create BTC Price Chart
function createBTCPriceChart(labels, prices) {
    const ctx = document.getElementById('btcPriceChart').getContext('2d');
    
    if (btcPriceChart) btcPriceChart.destroy();
    
    btcPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'BTC Price',
                data: prices,
                borderColor: 'rgba(247, 147, 26, 0.8)',
                backgroundColor: 'rgba(247, 147, 26, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

// Create Portfolio Growth Chart
function createPortfolioGrowthChart(labels, btcPrices) {
    const ctx = document.getElementById('portfolioGrowthChart').getContext('2d');
    const btcAmount = parseFloat(document.getElementById('btc-amount').value) || 0;
    const portfolioValues = btcPrices.map(price => price * btcAmount);
    
    if (portfolioGrowthChart) portfolioGrowthChart.destroy();
    
    portfolioGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: portfolioValues,
                borderColor: 'rgba(22, 199, 132, 0.8)',
                backgroundColor: 'rgba(22, 199, 132, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

// Calculate portfolio value
function calculatePortfolio() {
    const btcAmount = parseFloat(document.getElementById('btc-amount').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value) || 0;
    const currentPrice = parseFloat(document.getElementById('btc-price').textContent.replace(/[^0-9.]/g, ''));
    
    const portfolioValue = btcAmount * currentPrice;
    const profitLoss = portfolioValue - (btcAmount * purchasePrice);
    
    document.getElementById('portfolio-value').textContent = `$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    document.getElementById('profit-loss').textContent = `$${profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    
    // Update chart
    if (btcPriceChart) {
        createPortfolioGrowthChart(btcPriceChart.data.labels, btcPriceChart.data.datasets[0].data);
    }
}

// Event listeners
document.getElementById('btc-amount').addEventListener('input', calculatePortfolio);
document.getElementById('purchase-price').addEventListener('input', calculatePortfolio);

// Initialize app
async function initializeApp() {
    await fetchBTCPrice();
    await fetchHistoricalData();
    calculatePortfolio();
    setInterval(fetchBTCPrice, 60000); // Update price every minute
}

// Start the application
initializeApp();
