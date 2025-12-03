let myChart = null;

/**
 * Genera un numero casuale con distribuzione Normale Standard N(0,1)
 * Utilizzando la trasformata di Box-Muller.
 */
function generateGaussian() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converte [0,1) in (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * CLASSE GENERICA PER EQUAZIONI DIFFERENZIALI STOCASTICHE
 * Soddisfa la richiesta "Optional: Generalize the program"
 */
class SDESolver {
    constructor(driftFunc, diffusionFunc, dt, steps, x0) {
        this.drift = driftFunc;      // a(x, t)
        this.diffusion = diffusionFunc; // b(x, t)
        this.dt = dt;
        this.steps = steps;
        this.x0 = x0;
    }

    solve() {
        let t = 0;
        let x = this.x0;
        let pathX = [t.toFixed(2)];
        let pathY = [x];

        // Metodo di Eulero-Maruyama
        for (let i = 0; i < this.steps; i++) {
            // 1. Genera incremento Browniano dW
            // dW = sqrt(dt) * Z, dove Z ~ N(0,1)
            let dW = Math.sqrt(this.dt) * generateGaussian();

            // 2. Calcola i coefficienti al passo corrente
            let a = this.drift(x, t);
            let b = this.diffusion(x, t);

            // 3. Aggiorna X
            // X(t+dt) = X(t) + a*dt + b*dW
            x = x + (a * this.dt) + (b * dW);
            t += this.dt;

            pathX.push(t.toFixed(3));
            pathY.push(x);
        }
        return { times: pathX, values: pathY };
    }
}

function runSimulation() {
    // 1. Recupero Parametri
    const mu = parseFloat(document.getElementById('muInput').value);
    const sigma = parseFloat(document.getElementById('sigmaInput').value);
    const T = parseFloat(document.getElementById('timeInput').value);
    const N = parseInt(document.getElementById('nInput').value);
    const numPaths = parseInt(document.getElementById('pathsInput').value);

    const dt = T / N;
    const x0 = 0; // Il Processo di Wiener standard inizia a 0

    // 2. Definizione delle funzioni Drift e Diffusion per ABM/Wiener
    // dX = mu*dt + sigma*dW
    // Se mu=0 e sigma=1, è un Wiener standard puro.
    const driftFunction = (x, t) => mu;
    const diffusionFunction = (x, t) => sigma;

    // Esempio di come potresti generalizzare (Geometric Brownian Motion):
    // const diffusionFunction = (x, t) => sigma * x; 

    // 3. Simulazione e Preparazione Dataset per Chart.js
    const datasets = [];
    let lastFinalValue = 0;

    // Istanziamo il solver generico
    const solver = new SDESolver(driftFunction, diffusionFunction, dt, N, x0);

    for(let k = 0; k < numPaths; k++) {
        const result = solver.solve();
        lastFinalValue = result.values[result.values.length - 1];

        datasets.push({
            label: `Path ${k+1}`,
            data: result.values,
            borderColor: getRandomColor(),
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            tension: 0 // Linee spezzate (Brownian motion è irregolare)
        });

        // Usiamo l'asse temporale della prima simulazione per il grafico
        if(k === 0) var timeLabels = result.times;
    }

    // Aggiungi linea media teorica (Drift)
    // E[X_t] = X_0 + mu * t
    let theoreticalMean = timeLabels.map(t => x0 + mu * parseFloat(t));
    datasets.push({
        label: 'Mean Trend (Drift)',
        data: theoreticalMean,
        borderColor: 'black',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
    });

    // 4. Rendering Chart
    const ctx = document.getElementById('wienerChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Disabilita animazione per performance su N alto
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: { title: { display: true, text: 'Time (t)' }, ticks: { maxTicksLimit: 10 } },
                y: { title: { display: true, text: 'Value W(t)' } }
            },
            plugins: {
                title: { display: true, text: `Wiener Process / ABM (dt=${dt.toFixed(4)})` },
                legend: { display: numPaths <= 5 } // Nascondi legenda se ci sono troppe linee
            }
        }
    });

    // 5. Aggiorna Statistiche UI
    document.getElementById('lastValue').innerText = lastFinalValue.toFixed(4);
    document.getElementById('theoMean').innerText = (mu * T).toFixed(4);
    document.getElementById('theoStd').innerText = (sigma * Math.sqrt(T)).toFixed(4);
}

// Utility per colori casuali
function getRandomColor() {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r},${g},${b})`;
}

window.onload = runSimulation;