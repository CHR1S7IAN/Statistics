let myChart = null;

function runSimulation() {
    // 1. Recupero Valori Input
    const lambda = parseFloat(document.getElementById('lambdaInput').value);
    const n = parseInt(document.getElementById('nInput').value);
    const T = 1.0; // Tempo totale normalizzato a 1

    // Validazione base
    if (n < lambda) {
        alert("Attenzione: 'n' deve essere molto più grande di Lambda per una buona approssimazione!");
        return;
    }

    // 2. Logica di Simulazione (Bernoulli Approximation)
    const dt = T / n;       // Ampiezza di ogni sotto-intervallo
    const p = lambda / n;   // Probabilità di successo in ogni intervallo
    
    let timePoints = [];    // Asse X
    let eventsCount = [];   // Asse Y (Traiettoria campionaria)
    let theoretical = [];   // Linea media teorica
    
    let currentCount = 0;

    // Ciclo su ogni micro-intervallo
    for (let i = 0; i <= n; i++) {
        let currentTime = i * dt;
        
        // Aggiungiamo il punto corrente ai dati
        timePoints.push(currentTime.toFixed(3)); // Arrotondiamo per pulizia asse X
        eventsCount.push(currentCount);
        theoretical.push(lambda * currentTime); // Media teorica lineare: E[N(t)] = lambda * t

        // Generazione evento (Lancio della moneta)
        // Non lo facciamo all'ultimo step (i=n) perché è la fine dell'intervallo
        if (i < n) {
            if (Math.random() < p) {
                currentCount++;
            }
        }
    }

    // 3. Aggiornamento Statistiche UI
    document.getElementById('totalEvents').innerText = currentCount;
    document.getElementById('expectedEvents').innerText = lambda;
    document.getElementById('singleProb').innerText = p.toFixed(5);

    // 4. Rendering del Grafico con Chart.js
    const ctx = document.getElementById('poissonChart').getContext('2d');

    // Se esiste già un grafico, distruggilo prima di crearne uno nuovo
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timePoints, // Asse X
            datasets: [
                {
                    label: 'Processo di Conteggio N(t)',
                    data: eventsCount,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderWidth: 2,
                    stepped: true, // FONDAMENTALE: Rende il grafico a gradini (tipico dei processi di conteggio)
                    pointRadius: 0, // Nasconde i punti per fluidità
                    fill: true
                },
                {
                    label: 'Media Teorica E[N(t)] = λt',
                    data: theoretical,
                    borderColor: '#e74c3c',
                    borderWidth: 2,
                    borderDash: [5, 5], // Linea tratteggiata
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tempo (t)'
                    },
                    ticks: {
                        maxTicksLimit: 10 // Evita di mostrare 5000 etichette
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Numero di Eventi'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Simulazione Poisson (λ=${lambda}, n=${n})`
                }
            }
        }
    });
}

// Avvia la simulazione al caricamento della pagina
window.onload = runSimulation;