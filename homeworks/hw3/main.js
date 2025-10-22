document.addEventListener("DOMContentLoaded", () => {
  const testo = document.getElementById("textBox").innerText;

  const distribuzioneLettere = calcolaDistribuzioneLettere(testo);
  mostraGrafico(distribuzioneLettere, "chartPlainLetter");

  const distribuzioneNumeri = calcolaDistribuzioneASCII(testo);
  mostraGrafico(distribuzioneNumeri, "chartPlainNumber");

  const distribuzioneNumeriCifrati = calcolaDistribuzioneNumeriCifratiASCII(testo);
  mostraGrafico(distribuzioneNumeriCifrati, "chartCipherNumber", true);
});

function calcolaDistribuzioneLettere(testo) {
  // Mantieni solo lettere non accentate (a-z)
  const testoPulito = testo.toLowerCase().replace(/[^a-z]/g, "");

  // Inizializza tutte le lettere a 0
  const alfabeto = "abcdefghijklmnopqrstuvwxyz".split("");
  const freq = {};
  alfabeto.forEach(l => freq[l] = 0);

  // Conta le lettere
  for (const ch of testoPulito) {
    if (freq.hasOwnProperty(ch)) freq[ch]++;
  }

  // Restituisce array ordinato
  return alfabeto.map(l => ({ lettera: l, conteggio: freq[l] }));
}

function calcolaDistribuzioneASCII(testo) {
  // 1. Mantieni solo lettere non accentate (a-z)
  // Questa riga rimane invariata e fa già quello che chiedi.
  const testoPulito = testo.toLowerCase().replace(/[^a-z]/g, "");

  // 2. Inizializza tutti i codici ASCII (97-122) a 0
  // 'a' è 97, 'z' è 122. Ci sono 26 lettere.
  // Crea un array [97, 98, ..., 122]
  const asciiEtichette = Array.from({length: 26}, (_, i) => i + 97);
  const freq = {};
  asciiEtichette.forEach(n => freq[n] = 0);

  // 3. Conta le lettere, registrandole con il loro codice ASCII
  for (const ch of testoPulito) {
    // Trasforma la lettera nel suo codice ASCII (es. 'a' -> 97)
    // Ho rimosso il "- 96"
    const num = ch.charCodeAt(0); 

    // Incrementa il conteggio per il codice ASCII corrispondente
    if (freq.hasOwnProperty(num)) {
      freq[num]++;
    }
  }

  // 4. Restituisce array ordinato per codice ASCII
  return asciiEtichette.map(n => ({ 
    codiceAscii: n, 
    conteggio: freq[n] 
  }));
}

function calcolaDistribuzioneNumeriCifratiASCII(testo) {
  // --- Impostazioni Chiave RSA ---
  const n = 187;
  const e = 3;
  
  // 1. Mantieni solo lettere non accentate (a-z)
  const testoPulito = testo.toLowerCase().replace(/[^a-z]/g, "");

  // 2. Inizializza tutti i possibili numeri RISULTANTI (da 0 a n-1)
  // Questo non cambia, perché l'output è sempre (mod 55).
  const freq = {};
  for (let i = 0; i < n; i++) {
    freq[i] = 0;
  }

  // 3. Mappa, Cifra e Conta
  for (const ch of testoPulito) {
    // a. Trasforma la lettera nel suo codice ASCII (es. 'a' -> 97)
    // --- QUESTA È LA RIGA MODIFICATA ---
    const M = ch.charCodeAt(0); 

    // b. Applica la cifratura RSA
    // C = M^e (mod n)
    // Esempio: C = (97 ** 3) % 55 = 912673 % 55 = 7
    const C = (M ** e) % n;

    // c. Incrementa il conteggio per il numero CIFRATO risultante
    if (freq.hasOwnProperty(C)) {
      freq[C]++;
    }
  }

  // 4. Restituisce array ordinato per numero cifrato (da 0 a 54)
  // Anche questo non cambia.
  const etichetteRisultanti = Array.from({length: n}, (_, i) => i);
  
  return etichetteRisultanti.map(valoreCifrato => ({ 
    numeroCifrato: valoreCifrato, 
    conteggio: freq[valoreCifrato] 
  }));
}

// Aggiunto 'filtraEtichetteVuote' come ultimo parametro
function mostraGrafico(dati, elementChart, filtraEtichetteVuote = false) { 
  const ctx = document.getElementById(elementChart);
  
  const labels = dati.map(d => d.lettera || d.numero || d.codiceAscii || d.numeroCifrato);
  const values = dati.map(d => d.conteggio);

  // --- Inizio Blocco Opzioni ---
  // Ho spostato la logica dei ticks qui fuori per chiarezza
  
  // 1. Definiamo le opzioni di base per i ticks
  const ticksOptions = {
    autoSkip: false,
    maxRotation: 0,
    minRotation: 0
  };

  // 2. Controlliamo il nostro NUOVO parametro
  if (filtraEtichetteVuote === true) {
    // 3. Se è VERO, aggiungiamo il callback di filtro
    ticksOptions.callback = function(value, index, ticks) {
      if (values[index] > 0) {
        return value; // Mostra etichetta
      } else {
        return null;  // Nascondi etichetta
      }
    };
  }
  // --- Fine Blocco Opzioni ---


  // Rende il canvas pienamente responsive
  ctx.parentElement.style.position = "relative";
  ctx.parentElement.style.width = "100%";
  ctx.parentElement.style.height = "auto";

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Frequenza",
        data: values,
        borderWidth: 1,
        backgroundColor: "rgba(75, 123, 236, 0.6)",
        borderColor: "rgba(75, 123, 236, 1)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, 
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Distribuzione Frequenze"
        }
      },
      scales: {
        x: {
          // 4. Usiamo le nostre opzioni per i ticks
          ticks: ticksOptions, 
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.1)" }
        }
      }
    }
  });
}