/**
 * NUOVA FUNZIONE HELPER
 * Calcola le combinazioni (n su k) in modo efficiente.
 * @param {number} n - Il numero totale di prove (settimane).
 * @param {number} k - Il numero di successi.
 * @returns {number} Il numero di combinazioni C(n, k).
 */
function combinations(n, k) {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k === 0 || k === n) {
        return 1;
    }
    // Sfrutta la simmetria: C(n, k) = C(n, n-k)
    if (k > n / 2) {
        k = n - k;
    }
    let res = 1;
    for (let i = 1; i <= k; i++) {
        // Calcolo progressivo per evitare numeri troppo grandi
        res = res * (n - i + 1) / i;
    }
    return res;
}

/**
 * NUOVA FUNZIONE HELPER
 * Calcola i conteggi attesi (frequenza teorica) per la distribuzione binomiale.
 * @param {number} n_weeks - Numero di prove (n).
 * @param {number} m_attackers - Numero di simulazioni totali (m).
 * @param {number} p - Probabilità di successo (+1).
 * @param {string[]} all_scores - Array dei punteggi finali possibili (asse X).
 * @returns {number[]} Array dei conteggi attesi (asse Y).
 */
function calculateBinomialDistribution(n_weeks, m_attackers, p, all_scores) {
    const expectedCounts = [];
    const n = n_weeks;
    const m = m_attackers;

    for (const score_str of all_scores) {
        const score = parseInt(score_str);
        
        // Dobbiamo convertire il 'punteggio' S in 'k' (numero di successi)
        // Il punteggio finale è S = (k * +1) + ((n-k) * -1) = 2k - n
        // Quindi, k = (S + n) / 2
        const k = (score + n) / 2;

        // Se k non è un intero, la probabilità è 0 (impossibile con n passi)
        if (k % 1 !== 0) {
            expectedCounts.push(0);
            continue;
        }

        // Calcola la probabilità binomiale P(X=k) = C(n, k) * p^k * (1-p)^(n-k)
        const prob_k = combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        
        // Calcola il conteggio atteso (Frequenza teorica)
        const expectedCount = m * prob_k;
        
        expectedCounts.push(expectedCount);
    }
    return expectedCounts;
}
function generateSimulationData(weeks, attackers) {
    const seriesData = [];
    const labelsAsseX = [];

    // 1. Genera le etichette per l'asse X (es. ['1', '2', ..., 50])
    for (let i = 1; i <= weeks; i++) {
        labelsAsseX.push(`${i}`);
    }

    // 2. Ciclo esterno per ogni simulazione (ogni linea)
    for (let j = 0; j < attackers; j++) {
        
        const datiPunteggioSingolaSimulazione = [];
        let punteggioCorrente = 0;

        // 3. Ciclo interno per ogni lancio (ogni punto sull'asse X)
        for (let i = 1; i <= weeks; i++) {
            const risultato = Math.round(Math.random()); // 0 (Croce) o 1 (Testa)
            if (risultato === 1) {
                punteggioCorrente++;
            }else{
                punteggioCorrente--;
            }
            // Calcola la frequenza relativa (punteggio / n_lanci)
            datiPunteggioSingolaSimulazione.push(punteggioCorrente);
        }
        
        // 4. Aggiungi i dati di questa linea all'array delle serie
        seriesData.push({
            label: `Simulazione ${j + 1}`,
            data: datiPunteggioSingolaSimulazione
        });
    }

    // 5. Restituisci i dati pronti per il grafico
    return { seriesData, labelsAsseX };
}

function generateSimulationDataFairless(weeks, attackers, probabilityPercent=50) {
    const seriesData = [];
    const labelsAsseX = [];

    // 1. Converte la probabilità da percentuale (es. 90) a decimale (es. 0.9)
    const probabilityDecimal = probabilityPercent / 100;

    // 1. Genera le etichette per l'asse X (es. ['1', '2', ..., 50])
    for (let i = 1; i <= weeks; i++) {
        labelsAsseX.push(`${i}`);
    }

    // 2. Ciclo esterno per ogni simulazione (ogni linea)
    for (let j = 0; j < attackers; j++) {
        
        const datiPunteggioSingolaSimulazione = [];
        let punteggioCorrente = 0;

        // 3. Ciclo interno per ogni lancio (ogni punto sull'asse X)
        for (let i = 1; i <= weeks; i++) {
            
            const risultato = (Math.random() < probabilityDecimal) ? 1 : 0;

            if (risultato === 0) {
                punteggioCorrente++;
            }else{
                punteggioCorrente--;
            }
            datiPunteggioSingolaSimulazione.push(punteggioCorrente);
        }
        
        // 4. Aggiungi i dati di questa linea all'array delle serie
        seriesData.push({
            label: `Attacker ${j + 1}`,
            data: datiPunteggioSingolaSimulazione
        });
    }

    // 5. Restituisci i dati pronti per il grafico
    return { seriesData, labelsAsseX };
}

function calculateScoreDistribution(seriesData, weeks) {
    const scoreCounts = {};

    // 1. Inizializza tutti i possibili punteggi a 0.
    // I punteggi finali possibili hanno la stessa parità di 'weeks'.
    // Es. 50 settimane: -50, -48, ..., 0, ..., 48, 50
    // Es. 51 settimane: -51, -49, ..., 1, ..., 49, 51
    for (let score = -weeks; score <= weeks; score += 2) {
        scoreCounts[score] = 0;
    }

    // 2. Scorre ogni simulazione e incrementa i conteggi REALI.
    for (const simulation of seriesData) {
        const trajectory = simulation.data;
        const finalScore = trajectory[trajectory.length - 1];

        // Se per qualche motivo un punteggio non fosse nella lista 
        // (non dovrebbe succedere, ma per sicurezza), lo contiamo comunque.
        if (scoreCounts[finalScore] !== undefined) {
             scoreCounts[finalScore]++;
        } else {
             // Questo caso non dovrebbe verificarsi se la logica di
             // generateSimulationData è corretta (+1 / -1).
             console.warn(`Punteggio anomalo rilevato: ${finalScore}`);
             scoreCounts[finalScore] = 1;
        }
    }

    // 3. Converte l'oggetto {punteggio: conteggio} in array per Chart.js.
    // Ora siamo sicuri che tutti i punteggi ci sono.
    
    // Ordina le chiavi (punteggi) numericamente.
    const sortedScores = Object.keys(scoreCounts)
                              .map(Number)
                              .sort((a, b) => a - b);

    // 4. Crea gli array finali
    const labels = sortedScores.map(String);
    const data = sortedScores.map(score => scoreCounts[score]);

    return { labels, data };
}

function createChart(elementSelector, seriesData, labelsAsseX, weeks, attackers) {
    
    // Get the canvas element
    const ctx = document.getElementById(elementSelector).getContext('2d');

    // Create the chart
    return new Chart(ctx, {
        type: 'line', // The type of chart we want to create
        data: {
            labels: labelsAsseX,
            datasets: seriesData
        },
        maintainAspectRatio: false,
        options: {
            plugins: { 
                title: {
                    display: true,
                    text: attackers + " Attacker/s over " + weeks + " week/s"
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
                        text: 'Score' 
                    },
                    ticks: {
                        stepSize: 1 // <-- RETICOLATO FISSO PER L'ASSE Y
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Week/s'
                    },
                    ticks: {
                        stepSize: 5 // <-- RETICOLATO FISSO PER L'ASSE X
                    }
                }
            }
        }
    });
}


/**
 * FUNZIONE MODIFICATA
 * Crea un grafico a barre per la distribuzione E sovrappone la linea teorica.
 */
function createDistributionChart(elementSelector, distributionData, weeks, attackers) {
    
    const ctx = document.getElementById(elementSelector).getContext('2d');

    // --- INIZIO MODIFICA ---
    // Calcola la distribuzione binomiale teorica (per p=0.5, come da generateSimulationData)
    const p = 0.5; 
    const theoreticalData = calculateBinomialDistribution(
        weeks, 
        attackers, 
        p, 
        distributionData.labels // Passa le etichette (i punteggi)
    );
    // --- FINE MODIFICA ---

    return new Chart(ctx, {
        type: 'bar', // Tipo base (Chart.js gestirà il mix)
        data: {
            labels: distributionData.labels, 
            datasets: [
                // Dataset 1: Barre (Dati Osservati)
                {
                    label: 'Conteggio Simulazioni (Osservato)',
                    data: distributionData.data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    type: 'bar' // Specifica il tipo per questo dataset
                },
                // Dataset 2: Linea (Dati Teorici)
                {
                    label: 'Distribuzione Binomiale (Teorica)',
                    data: theoreticalData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 3, // Linea più spessa per visibilità
                    type: 'line', // Specifica il tipo per questo dataset
                    fill: false,
                    pointRadius: 0 // Nasconde i punti sulla linea
                }
            ]
        },
        options: {
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    // Titolo aggiornato
                    text: `Distribuzione Osservata vs. Teorica (${attackers} simulazioni, ${weeks} settimane)`
                },
                legend: {
                    display: true // Abilita la leggenda (ora ci sono 2 dataset)
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Punteggio Finale'
                    },
                },
                y: {
                    
                    title: {
                        display: true,
                        text: 'Conteggio (Frequenza)'
                    },
                    beginAtZero: true 
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Impostazioni per il Grafico 1 (Singola Simulazione) ---
    let weeks = 50;
    let attackers = 1;

    // 1. Genera i dati per il primo grafico
    let {seriesData, labelsAsseX} = generateSimulationData(weeks, attackers);
    // 2. Crea il primo grafico
    createChart(
        "chartOneAttacker",
        seriesData, 
        labelsAsseX, 
        weeks, 
        attackers
    );


    // --- Impostazioni per il Grafico 2 (50 Simulazioni) ---
    weeks = 50;
    attackers = 50;
    
    // 1. Genera i dati per il secondo grafico
    ({seriesData, labelsAsseX} = generateSimulationData(weeks, attackers));


    // 2. Crea il secondo grafico
    createChart(
        "chart50Attacker",
        seriesData, 
        labelsAsseX, 
        weeks, 
        attackers
    );

    // --- Impostazioni per il Grafico 3 (No Fair) ---

    weeks = 50;
    attackers = 50;

    // 1. Genera i dati
    ({seriesData, labelsAsseX} = generateSimulationDataFairless(weeks, attackers, 90));

    createChart(
        "chart50AttackerNoFair", 
        seriesData,
        labelsAsseX,
        weeks,
        attackers
    );

    // --- Impostazioni per il Grafico 4 (con Distribuzione) ---
    weeks = 50;
    attackers = 500;

    // 1. Genera i dati (per il grafico a linee e per la distribuzione)
    ({seriesData, labelsAsseX} = generateSimulationData(weeks, attackers));

    // (Opzionale) Se hai un div per il grafico
    createChart(
        "chart5050WDLeft", 
        seriesData,
        labelsAsseX,
        weeks,
        attackers
    );

    // 2. Calcola la distribuzione
    let distributionData = calculateScoreDistribution(seriesData, weeks);

    // 3. Crea il grafico di distribuzione
    // --- INIZIO MODIFICA ---
    createDistributionChart(
        "chart5050WDRight", 
        distributionData,
        weeks,
        attackers // <-- Aggiungi questo argomento
    );
    // --- FINE MODIFICA ---


    // --- INIZIO SEZIONE INTERATTIVA ---
    
    // Variabili per tenere traccia dei grafici interattivi (per poterli distruggere)
    let interactiveLineChart = null;
    let interactiveBarChart = null;

    // Recupera gli elementi del DOM
    const runButton = document.getElementById('btnRunInteractive');
    const weeksInput = document.getElementById('inputInteractiveWeeks');
    const attackersInput = document.getElementById('inputInteractiveAttackers');

    /**
     * Funzione principale che legge gli input, genera i dati e crea i grafici
     */
    function runInteractiveSimulation() {
        
        // 1. Distruggi i vecchi grafici (se esistono) per evitare conflitti
        if (interactiveLineChart) {
            interactiveLineChart.destroy();
        }
        if (interactiveBarChart) {
            interactiveBarChart.destroy();
        }

        // 2. Leggi i nuovi valori dagli input
        const weeks = parseInt(weeksInput.value) || 50;
        const attackers = parseInt(attackersInput.value) || 500;
        
        // 3. Genera i dati per le traiettorie (Random Walk)
        // Usa la tua funzione esistente con i nuovi parametri
        const { seriesData, labelsAsseX } = generateSimulationData(weeks, attackers);

        // 4. Crea il grafico delle traiettorie
        // Usa la tua funzione 'createChart' esistente
        interactiveLineChart = createChart(
            "chartInteractiveTrajectories", // ID del nuovo canvas
            seriesData,
            labelsAsseX,
            weeks,
            attackers
        );

        // 5. Calcola i dati per la distribuzione
        // Usa la tua funzione 'calculateScoreDistribution' esistente
        const distributionData = calculateScoreDistribution(seriesData, weeks);

        // 6. Crea il grafico della distribuzione (con la linea binomiale)
        // Usa la tua funzione 'createDistributionChart' esistente
        
        // NOTA IMPORTANTE: La linea binomiale NON è indipendente!
        // Dipende sia da 'n' (weeks) per la sua forma (ampiezza e posizione)
        // sia da 'm' (attackers) per la sua altezza (conteggio atteso).
        // Le tue funzioni la ricalcolano correttamente.
        interactiveBarChart = createDistributionChart(
            "chartInteractiveDistribution", // ID del nuovo canvas
            distributionData,
            weeks,
            attackers // Passa il numero di attackers per scalare la binomiale
        );
    }

    // 7. Aggiungi l'evento al click del bottone
    runButton.addEventListener('click', runInteractiveSimulation);

    // 8. Esegui la simulazione una prima volta al caricamento della pagina
    //    con i valori di default (50 settimane, 500 attacker)
    runInteractiveSimulation();
    


});