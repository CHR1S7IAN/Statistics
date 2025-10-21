/**
 * Funzione 1: Generatore di Dati
 * Questa funzione si occupa solo di simulare i lanci e preparare
 * i dati nel formato richiesto da ChartJS.
 * È una "pure function": non disegna nulla, restituisce solo dati.
 *
 * @param {number} numTrials - Il numero di lanci (asse X).
 * @param {number} numSimulations - Il numero di linee (serie) da generare.
 * @returns {object} Un oggetto contenente { seriesData, labelsAsseX }.
 */
function generateSimulationData(numTrials, numSimulations) {
    const seriesData = [];
    const labelsAsseX = [];

    // 1. Genera le etichette per l'asse X (es. ['1', '2', ..., 50])
    for (let i = 1; i <= numTrials; i++) {
        labelsAsseX.push(`${i}`);
    }

    // 2. Ciclo esterno per ogni simulazione (ogni linea)
    for (let j = 0; j < numSimulations; j++) {
        
        const datiPunteggioSingolaSimulazione = [];
        let punteggioCorrente = 0;

        // 3. Ciclo interno per ogni lancio (ogni punto sull'asse X)
        for (let i = 1; i <= numTrials; i++) {
            const risultato = Math.round(Math.random()); // 0 (Croce) o 1 (Testa)
            if (risultato === 1) {
                punteggioCorrente++;
            }
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

/**
 * Funzione 2: Identica alla funzione 1, ma con la probabilità variabile
 * @param {number} numTrials - Il numero di lanci (asse X).
 * @param {number} numSimulations - Il numero di linee (serie) da generare.
 * @param {number} probabilityPercent - Probabilità di vincita.
 * @returns {object} Un oggetto contenente { seriesData, labelsAsseX }.
 */
function generateSimulationDataFairless(numTrials, numSimulations, probabilityPercent=50) {
    const seriesData = [];
    const labelsAsseX = [];

    // 1. Converte la probabilità da percentuale (es. 90) a decimale (es. 0.9)
    const probabilityDecimal = probabilityPercent / 100;

    // 1. Genera le etichette per l'asse X (es. ['1', '2', ..., 50])
    for (let i = 1; i <= numTrials; i++) {
        labelsAsseX.push(`${i}`);
    }

    // 2. Ciclo esterno per ogni simulazione (ogni linea)
    for (let j = 0; j < numSimulations; j++) {
        
        const datiPunteggioSingolaSimulazione = [];
        let punteggioCorrente = 0;

        // 3. Ciclo interno per ogni lancio (ogni punto sull'asse X)
        for (let i = 1; i <= numTrials; i++) {
            
            const risultato = (Math.random() < probabilityDecimal) ? 1 : 0;

            if (risultato === 1) {
                punteggioCorrente++;
            }
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

/**
 * Funzione 3: Creatore di Grafici per le simulazini
 */
function createCoinFlipChart(elementSelector, seriesData, labelsAsseX, numTrials, numSimulations) {
    
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
                    text: numSimulations + " Simulazione/i con " + numTrials + " lanci"
                },
                legend: { 
                    display: false 
                }
            },
            scales: {
                y: {
                    min: 0,          
                    max: numTrials,    
                    title: { 
                        display: true,
                        text: 'Score' 
                    },
                    ticks: {
                        stepSize: 5 // <-- RETICOLATO FISSO PER L'ASSE Y
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Lanci'
                    },
                    ticks: {
                        stepSize: 5 // <-- RETICOLATO FISSO PER L'ASSE Y
                    }
                }
            }
        }
    });
}

/**
 * Calcola la distribuzione dei punteggi finali.
 * @param {Array<Object>} seriesData - L'array di oggetti { name: '...', data: [...] }.
 * @returns {Object} Un oggetto (mappa) di conteggi. Esempio: { '23': 5, '24': 12 }
 */
function calculateScoreDistribution(seriesData) {
    const scoreCounts = {}; // Oggetto per memorizzare i conteggi

    for (const simulation of seriesData) {
        const scoreHistory = simulation.data;
        if (scoreHistory.length > 0) {
            const finalScore = scoreHistory[scoreHistory.length - 1];
            scoreCounts[finalScore] = (scoreCounts[finalScore] || 0) + 1;
        }
    }
    return scoreCounts;
}
/**
 * Funzione 4: Creatore del Grafico di Distribuzione (Barre Orizzontali)
*/
function createDistributionChart(elementSelector, scoreCounts, numTrials) {
    
    // Get the canvas element
    const ctx = document.getElementById(elementSelector).getContext('2d');
    
    const allPossibleLabels = [];
    const allCountsData = [];

    // Cicliamo da 0 a 50 (se numTrials è 50)
    for (let i = 0; i <= numTrials; i++) {
        
        // 1. Aggiungi l'etichetta (es. "0", "1", "2", ...)
        allPossibleLabels.push(i.toString());
        
        // 2. Cerca il conteggio per questo punteggio.
        //    Se esiste in scoreCounts, usa quel valore.
        //    Altrimenti, usa 0.
        const count = scoreCounts[i] || 0;
        allCountsData.push(count);
    }

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allPossibleLabels, // Usa le etichette complete (0-50)
            datasets: [{
                label: 'Numero di Simulazioni',
                data: allCountsData, // Usa i conteggi completi (con gli zeri)
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y', // La rende orizzontale
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuzione Punteggi Finali'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distribution'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                y: { // Asse Y (verticale)
                    title: {
                        display: false,
                        text: 'score'
                    },
                    reverse: true,
                    position: 'right',
                    // AGGIUNTO: Applica lo stesso filtro "ogni 5"
                    // per allinearlo al grafico di sinistra
                    ticks: {
                        callback: function(value, index, values) {
                            // 'value' qui è l'indice (0, 1, 2...)
                            // Usiamo l'indice per decidere
                            if (index % 5 === 0) {
                                // this.getLabelForValue(value) prende l'etichetta reale (es. "0", "5")
                                return this.getLabelForValue(value); 
                            }
                            return null; // Nasconde le altre
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Impostazioni per il Grafico 1 (Singola Simulazione) ---
    let trials = 50;
    let sims = 1;

    // 1. Genera i dati per il primo grafico
    let {seriesData, labelsAsseX} = generateSimulationData(trials, sims);
    // 2. Crea il primo grafico
    createCoinFlipChart(
        "chartOneSimulation",
        seriesData, 
        labelsAsseX, 
        trials, 
        sims
    );


    // --- Impostazioni per il Grafico 2 (50 Simulazioni) ---
    trials = 50;
    sims = 50;
    
    // 1. Genera i dati per il secondo grafico
    ({seriesData, labelsAsseX} = generateSimulationData(trials, sims));


    // 2. Crea il secondo grafico
    createCoinFlipChart(
        "chart50Simulation",
        seriesData, 
        labelsAsseX, 
        trials, 
        sims
    );

    // --- Impostazioni per il Grafico 3 (con Distribuzione) ---
    trials = 50;
    sims = 500;

    // 1. Genera i dati (per il grafico a linee e per la distribuzione)
    ({seriesData, labelsAsseX} = generateSimulationData(trials, sims));

    // (Opzionale) Se hai un div per il grafico
    createCoinFlipChart(
        "chart500SimulationWD", 
        seriesData,
        labelsAsseX,
        trials,
        sims
    );

    // 2. Calcola la distribuzione
    let distributionData = calculateScoreDistribution(seriesData);

    // 3. Crea il grafico di distribuzione
    createDistributionChart(
        "chart500Distribution", 
        distributionData,
        trials
    );

    // 1. Genera i dati (per il grafico a linee e per la distribuzione)
    ({seriesData, labelsAsseX} = generateSimulationDataFairless(trials, sims, 90));

    createCoinFlipChart(
        "chart500SimulationWDTruccato", 
        seriesData,
        labelsAsseX,
        trials,
        sims
    );

    // 2. Calcola la distribuzione
    distributionData = calculateScoreDistribution(seriesData);

    // 3. Crea il grafico di distribuzione
    createDistributionChart(
        "chart500DistributionTruccato", 
        distributionData,
        trials
    );

    // --- 2. LOGICA PER LA SEZIONE INTERATTIVA ---
    
    // Variabili per tenere traccia dei grafici interattivi
    let interactiveLineChart = null;
    let interactiveBarChart = null;

    // Recupera gli elementi del DOM
    const runButton = document.getElementById('btnInteractiveRun');
    const trialsInput = document.getElementById('inputInteractiveTrials');
    const simsInput = document.getElementById('inputInteractiveSims');
    const probInput = document.getElementById('inputInteractiveProb');

    // Aggiungi l'evento al click del bottone
    runButton.addEventListener('click', () => {
        
        // 1. Distruggi i vecchi grafici interattivi (se esistono)
        if (interactiveLineChart) {
            interactiveLineChart.destroy();
        }
        if (interactiveBarChart) {
            interactiveBarChart.destroy();
        }

        // 2. Leggi i nuovi valori
        const trials = parseInt(trialsInput.value) || 50;
        const sims = parseInt(simsInput.value) || 10;
        const prob = parseInt(probInput.value) || 50;

        // 3. Genera nuovi dati
        const {seriesData, labelsAsseX} = generateSimulationDataFairless(trials, sims, prob);
        const distributionData = calculateScoreDistribution(seriesData);

        // 4. Crea i nuovi grafici e salva le loro istanze
        interactiveLineChart = createCoinFlipChart(
            "chartInteractiveSimulation", 
            seriesData,
            labelsAsseX,
            trials,
            sims
        );
        
        interactiveBarChart = createDistributionChart(
            "chartInteractiveDistribution", 
            distributionData,
            trials
        );
    });

    // (Opzionale) Esegui una prima simulazione interattiva al caricamento
    runButton.click();

});