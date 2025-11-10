/**
 * ==========================================================
 * NEW FUNCTIONS FOR HOMEWORK 8 (PASCAL'S TRIANGLE)
 * ==========================================================
 */

/**
 * Generates Pascal's (Tartaglia's) Triangle data.
 * @param {number} numRows - The number of rows to generate.
 * @returns {Array<Array<number>>} An array of arrays (the rows).
 */
function generatePascals(numRows) {
    const triangle = [];
    if (numRows <= 0) return triangle;

    for (let i = 0; i < numRows; i++) {
        const row = [1]; // The first element is always 1

        if (i > 0) {
            const prevRow = triangle[i - 1];
            // Calculate intermediate elements
            for (let j = 1; j < i; j++) {
                row.push(prevRow[j - 1] + prevRow[j]);
            }
            row.push(1); // The last element is always 1
        }
        triangle.push(row);
    }
    return triangle;
}

/**
 * Displays Pascal's Triangle in an HTML element, formatted with <pre>.
 * @param {string} containerId - The ID of the container div.
 * @param {number} numRows - The number of rows to display.
 */
function displayPascals(containerId, numRows) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const triangle = generatePascals(numRows);
    let html = '<pre>';
    
    // For centering: calculate the maximum width (the last row)
    const maxRowStr = triangle[triangle.length - 1].join('  ');
    const maxWidth = maxRowStr.length;

    for (const row of triangle) {
        const rowStr = row.join('  ');
        // Calculate padding for centering
        const padding = ' '.repeat(Math.floor((maxWidth - rowStr.length) / 2));
        html += padding + rowStr + '\n';
    }
    
    html += '</pre>';
    container.innerHTML = html;
}


/**
 * ==========================================================
 * CODE FROM HOMEWORK 7 (UNCHANGED)
 * Necessary for the interactive simulator
 * ==========================================================
 */

/**
 * Calculates combinations (n choose k) efficiently.
 * @param {number} n - The total number of trials (weeks).
 * @param {number} k - The number of successes.
 * @returns {number} The number of combinations C(n, k).
 */
function combinations(n, k) {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k === 0 || k === n) {
        return 1;
    }
    if (k > n / 2) {
        k = n - k;
    }
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

/**
 * Calculates the expected counts (theoretical frequency) for the binomial distribution.
 * @param {number} n_weeks - Number of trials (n).
 * @param {number} m_attackers - Total number of simulations (m).
 * @param {number} p - Probability of success (+1).
 * @param {string[]} all_scores - Array of possible final scores (X-axis).
 * @returns {number[]} Array of expected counts (Y-axis).
 */
function calculateBinomialDistribution(n_weeks, m_attackers, p, all_scores) {
    const expectedCounts = [];
    const n = n_weeks;
    const m = m_attackers;

    for (const score_str of all_scores) {
        const score = parseInt(score_str);
        
        // Convert the 'score' S into 'k' (number of +1 successes)
        // S = 2k - n  =>  k = (S + n) / 2
        const k = (score + n) / 2;

        if (k % 1 !== 0) { // If k is not an integer, p=0
            expectedCounts.push(0);
            continue;
        }

        const prob_k = combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        const expectedCount = m * prob_k;
        expectedCounts.push(expectedCount);
    }
    return expectedCounts;
}

/**
 * Generates data for a Symmetric Random Walk (p=0.5)
 * @param {number} weeks - Number of steps (n).
 * @param {number} attackers - Number of simulations (m).
 * @returns {object} { seriesData, labelsAsseX }
 */
function generateSimulationData(weeks, attackers) {
    const seriesData = [];
    const labelsAsseX = [];

    for (let i = 1; i <= weeks; i++) {
        labelsAsseX.push(`${i}`);
    }

    for (let j = 0; j < attackers; j++) {
        const datiPunteggioSingolaSimulazione = [];
        let punteggioCorrente = 0;

        for (let i = 1; i <= weeks; i++) {
            const risultato = Math.round(Math.random()); // 0 or 1
            if (risultato === 1) {
                punteggioCorrente++; // +1
            } else {
                punteggioCorrente--; // -1
            }
            datiPunteggioSingolaSimulazione.push(punteggioCorrente);
        }
        
        seriesData.push({
            label: `Simulation ${j + 1}`,
            data: datiPunteggioSingolaSimulazione
        });
    }
    return { seriesData, labelsAsseX };
}

// Note: the other functions from HMWK 7 (like generateSimulationDataFairless)
// are not necessary for the HMWK 8 demo,
// but I include them for completeness if you were to reuse the whole file.

function generateSimulationDataFairless(weeks, attackers, probabilityPercent=50) {
    const seriesData = [];
    const labelsAsseX = [];
    const probabilityDecimal = probabilityPercent / 100;

    for (let i = 1; i <= weeks; i++) {
        labelsAsseX.push(`${i}`);
    }

    for (let j = 0; j < attackers; j++) {
        const datiPunteggioSingolaSimulazione = [];
        let punteggioCorrente = 0;

        for (let i = 1; i <= weeks; i++) {
            // If p=90 (hack), random < 0.9 (true 90% of the time) => risultato = 1
            const risultato = (Math.random() < probabilityDecimal) ? 1 : 0;

            if (risultato === 0) { // Secure (10% of the time)
                punteggioCorrente++;
            } else { // Breached (90% of the time)
                punteggioCorrente--;
            }
            datiPunteggioSingolaSimulazione.push(punteggioCorrente);
        }
        
        seriesData.push({
            label: `Attacker ${j + 1}`,
            data: datiPunteggioSingolaSimulazione
        });
    }
    return { seriesData, labelsAsseX };
}

/**
 * Calculates the distribution of observed final scores.
 * @param {Array<Object>} seriesData 
 * @param {number} weeks 
 * @returns {object} { labels, data }
 */
function calculateScoreDistribution(seriesData, weeks) {
    const scoreCounts = {};

    // Initialize all possible scores (same parity as weeks)
    for (let score = -weeks; score <= weeks; score += 2) {
        scoreCounts[score] = 0;
    }

    for (const simulation of seriesData) {
        const trajectory = simulation.data;
        const finalScore = trajectory[trajectory.length - 1];

        if (scoreCounts[finalScore] !== undefined) {
             scoreCounts[finalScore]++;
        } else {
             // This should not happen if the logic is correct
             scoreCounts[finalScore] = 1;
        }
    }

    const sortedScores = Object.keys(scoreCounts)
                              .map(Number)
                              .sort((a, b) => a - b);
    
    const labels = sortedScores.map(String);
    const data = sortedScores.map(score => scoreCounts[score]);

    return { labels, data };
}

/**
 * Creates the line chart for trajectories.
 * @param {string} elementSelector 
 * @param {Array<Object>} seriesData 
 * @param {Array<string>} labelsAsseX 
 * @param {number} weeks 
 * @param {number} attackers 
 * @returns {Chart}
 */
function createChart(elementSelector, seriesData, labelsAsseX, weeks, attackers) {
    const ctx = document.getElementById(elementSelector).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsAsseX,
            datasets: seriesData
        },
        maintainAspectRatio: false,
        options: {
            plugins: { 
                title: {
                    display: true,
                    text: `${attackers} Trajectories (Random Walk) over ${weeks} weeks`
                },
                legend: { 
                    display: false 
                }
            },
            scales: {
                y: {
                    min: -weeks,          
                    max: weeks,    
                    title: { 
                        display: true,
                        text: 'Cumulative Score' 
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Weeks'
                    }
                }
            },
            elements: {
                point: {
                    radius: 0 // Hides points for cleaner graphs
                },
                line: {
                    borderWidth: 1,
                    tension: 0.1
                }
            }
        }
    });
}

/**
 * Creates the distribution chart (bars + theoretical line).
 * @param {string} elementSelector 
 * @param {object} distributionData - { labels, data }
 * @param {number} weeks 
 * @param {number} attackers 
 * @returns {Chart}
 */
function createDistributionChart(elementSelector, distributionData, weeks, attackers) {
    const ctx = document.getElementById(elementSelector).getContext('2d');

    // Calculate the theoretical binomial distribution (for p=0.5)
    const p = 0.5; 
    const theoreticalData = calculateBinomialDistribution(
        weeks, 
        attackers, 
        p, 
        distributionData.labels
    );

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: distributionData.labels, 
            datasets: [
                {
                    label: 'Observed Count (Simulations)',
                    data: distributionData.data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    type: 'bar'
                },
                {
                    label: 'Theoretical Binomial Distribution',
                    data: theoreticalData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 3,
                    type: 'line',
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Final Score Distribution vs. Theoretical (${attackers} simulations)`
                },
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Final Score'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count (Frequency)'
                    },
                    beginAtZero: true 
                }
            }
        }
    });
}


/**
 * ==========================================================
 * DOM EVENT HANDLER (for HMWK 8)
 * ==========================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LOGIC FOR PASCAL SECTION (NEW HMWK 8) ---
    
    const pascalRowsInput = document.getElementById('pascalRowsInput');
    const pascalButton = document.getElementById('btnDisplayPascal');
    const pascalContainerId = 'pascals-triangle-container';

    function updatePascalView() {
        const rows = parseInt(pascalRowsInput.value) || 10;
        displayPascals(pascalContainerId, rows);
    }

    if (pascalButton) {
        pascalButton.addEventListener('click', updatePascalView);
        updatePascalView(); // Initial call on load
    }

    
    // --- 2. LOGIC FOR INTERACTIVE SECTION (REUSED FROM HMWK 7) ---

    let interactiveLineChart = null;
    let interactiveBarChart = null;

    const runButton = document.getElementById('btnRunInteractive');
    const weeksInput = document.getElementById('inputInteractiveWeeks');
    const attackersInput = document.getElementById('inputInteractiveAttackers');

    function runInteractiveSimulation() {
        
        if (interactiveLineChart) {
            interactiveLineChart.destroy();
        }
        if (interactiveBarChart) {
            interactiveBarChart.destroy();
        }

        const weeks = parseInt(weeksInput.value) || 50;
        const attackers = parseInt(attackersInput.value) || 500;
        
        // Simulate only with p=0.5 (Symmetric Random Walk)
        const { seriesData, labelsAsseX } = generateSimulationData(weeks, attackers);

        interactiveLineChart = createChart(
            "chartInteractiveTrajectories",
            seriesData,
            labelsAsseX,
            weeks,
            attackers
        );

        const distributionData = calculateScoreDistribution(seriesData, weeks);

        interactiveBarChart = createDistributionChart(
            "chartInteractiveDistribution",
            distributionData,
            weeks,
            attackers
        );
    }

    if (runButton) {
        runButton.addEventListener('click', runInteractiveSimulation);
        runInteractiveSimulation(); // Run on load
    }

    // N.B.: The calls to static graphs from HMWK 7 have been removed
    // because the canvas elements 'chartOneAttacker', 'chart50Attacker' etc.
    // do not exist in this HTML file.

});