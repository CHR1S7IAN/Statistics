// Selezioniamo tutti gli elementi HTML
const textInput = document.getElementById('textInput');
const shiftKeyInput = document.getElementById('shiftKey');
const analyzeButton = document.getElementById('analyzeButton');
const originalCanvas = document.getElementById('originalChart');
const exampleCanvas = document.getElementById('exampleChart');
const example21Canvas = document.getElementById('examplePlainedChart');
const example22Canvas = document.getElementById('exampleCipheredChart');
const cipherCanvas = document.getElementById('cipherChart');

// Istanze per i nostri due grafici
let exampleChrartInstance = null;
let example21ChrartInstance = null;
let example22ChrartInstance = null;
let originalChartInstance = null;
let cipherChartInstance = null;

/**
 * Trova la chiave del Cifrario di Cesare trovando lo shift che minimizza
 * la somma delle differenze al quadrato tra le due distribuzioni.
 * @param {number[]} originalFreq - Array di 26 conteggi per il testo originale.
 * @param {number[]} cipherFreq - Array di 26 conteggi per il testo cifrato.
 * @returns {number} La chiave di shift più probabile.
 */
function findShiftKeyByMinDifference(originalFreq, cipherFreq) {
    let bestShift = 0;
    let minDifference = Infinity;

    // 1. Prova ogni possibile shift da 0 a 25
    for (let shift = 0; shift < 26; shift++) {
        let currentDifference = 0;

        // 2. Calcola la somma delle differenze al quadrato per lo shift corrente
        for (let i = 0; i < 26; i++) {
            // 3. "Sposta indietro" l'indice della distribuzione cifrata
            const shiftedIndex = (i + shift) % 26;
            
            const freqOriginal = originalFreq[i];
            const freqCipherShifted = cipherFreq[shiftedIndex];

            // 4. Calcola la differenza al quadrato e sommala
            currentDifference += Math.pow(freqOriginal - freqCipherShifted, 2);
        }

        // 5. Se questa differenza è la più bassa trovata finora, la salvo
        if (currentDifference < minDifference) {
            minDifference = currentDifference;
            bestShift = shift;
        }
    }

    return bestShift;
}

// Funzione per applicare il Cifrario di Cesare
function caesarCipher(text, shift) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let cipheredText = '';

    for (const char of text) {
        const index = alphabet.indexOf(char);
        if (index !== -1) { // Se è una lettera dell'alfabeto
            const newIndex = (index + shift) % 26;
            cipheredText += alphabet[newIndex];
        } else { // Se non è una lettera (spazio, punteggiatura, etc.)
            cipheredText += char;
        }
    }
    return cipheredText;
}

// Funzione riutilizzabile per calcolare la frequenza
function calculateFrequency(text) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const letterCounts = {};
    for (const char of text) {
        if (alphabet.includes(char)) {
            letterCounts[char] = (letterCounts[char] || 0) + 1;
        }
    }
    const chartLabels = alphabet.split('');
    const chartData = chartLabels.map(letter => letterCounts[letter] || 0);
    return { labels: chartLabels, data: chartData };
}

// Funzione riutilizzabile per disegnare un grafico
function drawChart(canvasElement, chartInstance, title, labels, data) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    const ctx = canvasElement.getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(26, 115, 232, 0.8)',
                borderColor: 'rgba(26, 115, 232, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    const exampleText = 'Hello World! My name is Christian';
    const exampleFrequency = calculateFrequency(exampleText);
    exampleChrartInstance = drawChart(
    exampleCanvas, 
    exampleChrartInstance, 
    'Example text distribution', 
    exampleFrequency.labels, 
    exampleFrequency.data
    );

    example21ChrartInstance = drawChart(
    example21Canvas, 
    example21ChrartInstance, 
    'Example plaintext distribution', 
    exampleFrequency.labels, 
    exampleFrequency.data
    );

    const cipheredText = caesarCipher(exampleText, 3);

    const cipherFrequency = calculateFrequency(cipheredText);
    example22ChrartInstance = drawChart(
        example22Canvas, 
        example22ChrartInstance, 
        'Example ciphered text distribution', 
        cipherFrequency.labels, 
        cipherFrequency.data
    );

});

// Evento principale al click del pulsante
analyzeButton.addEventListener('click', () => {
    // 1. Legge gli input dell'utente
    const originalText = textInput.value.toLowerCase();
    const shiftKey = parseInt(shiftKeyInput.value) || 0;

    // 2. Analizza e disegna il grafico per il testo originale
    const originalFrequency = calculateFrequency(originalText);
    originalChartInstance = drawChart(
        originalCanvas, 
        originalChartInstance, 
        'Frequenza Testo Originale', 
        originalFrequency.labels, 
        originalFrequency.data
    );

    // 3. Applica il cifrario
    const cipheredText = caesarCipher(originalText, shiftKey);

    
    // 4. Analizza e disegna il grafico per il testo cifrato
    const cipherFrequency = calculateFrequency(cipheredText);
    cipherChartInstance = drawChart(
        cipherCanvas, 
        cipherChartInstance, 
        `Frequenza Testo Cifrato (Chiave: ${shiftKey})`, 
        cipherFrequency.labels, 
        cipherFrequency.data
    );
    // 5. Trova la chiave confrontando le distribuzioni
    const foundKey = findShiftKeyByMinDifference(originalFrequency.data, cipherFrequency.data);

    // 6. Mostra il risultato all'utente
    document.getElementById('foundKeyResult').textContent = foundKey;
});