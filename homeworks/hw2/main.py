import sqlite3
import random
from collections import Counter
import matplotlib.pyplot as plt
import numpy as np

def connect_to_db():
    # Connessione (crea il file se non esiste)
    conn = sqlite3.connect("people_db.sqlite")
    cur = conn.cursor()
    return conn, cur

def populate_database_if_empty(cur, conn):
    # Crea la tabella
    cur.execute("""
        CREATE TABLE IF NOT EXISTS people (
            name TEXT PRIMARY KEY,
            eye_color TEXT,
            hair_color TEXT,
            weight REAL
        )
    """)

    # Liste di possibili valori
    names = [
        "Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Hannah", "Ivan", "Julia",
        "Kevin", "Laura", "Mike", "Nina", "Oscar", "Paula", "Quinn", "Rita", "Sam", "Tina",
        "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zane", "Luca", "Sara", "Giorgio", "Marta",
        "Elena", "Matteo", "Clara", "Paolo", "Giulia", "Marco", "Silvia", "Andrea", "Chiara", "Roberto", "Francesca", "Antonio", "Martina", "Federico", "Camilla", "Stefano", "Sofia", "Riccardo", "Beatrice", "Leonardo"
    ]

    eye_colors = ["blue", "green", "brown", "hazel", "gray"]
    hair_colors = ["blonde", "brown", "black", "red", "gray"]

    # Genera dati casuali
    people_data = []
    for name in names:
        eye = random.choice(eye_colors)
        hair = random.choice(hair_colors)
        weight = round(random.uniform(50, 100), 1)  # peso tra 50 e 100 kg
        people_data.append((name, eye, hair, weight))

    # Inserisci i dati nel database
    cur.executemany("""
        INSERT OR REPLACE INTO people (name, eye_color, hair_color, weight)
        VALUES (?, ?, ?, ?)
        """, people_data)

    conn.commit()

'''
# Leggi e mostra i dati
cur.execute("SELECT * FROM people")
rows = cur.fetchall()

print("Elenco persone nel database:\n")
for row in rows:
    print(f"Nome: {row[0]:<10} | Occhi: {row[1]:<6} | Capelli: {row[2]:<6} | Peso: {row[3]} kg")

# Chiudi
cur.close()
conn.close()

# Connessione al database
conn = sqlite3.connect("people_db.sqlite")
cur = conn.cursor()
'''

'''
# Leggi tutti i dati
cur.execute("SELECT eye_color, hair_color, weight FROM people")
rows = cur.fetchall()

# Separiamo le colonne
eye_colors = [row[0] for row in rows]
hair_colors = [row[1] for row in rows]
weights = [row[2] for row in rows]

# Distribuzione dei colori occhi
eye_distribution = Counter(eye_colors)
print("👁️ Distribuzione colori occhi:")
for color, count in eye_distribution.items():
    print(f"{color}: {count}")

# Distribuzione dei colori capelli
hair_distribution = Counter(hair_colors)
print("\n💇 Distribuzione colori capelli:")
for color, count in hair_distribution.items():
    print(f"{color}: {count}")

# Definisci categorie di peso
def categorize_weight(w):
    if w < 60:
        return "Sottopeso"
    elif w < 80:
        return "Normopeso"
    else:
        return "Sovrappeso"

weight_categories = [categorize_weight(w) for w in weights]
weight_distribution = Counter(weight_categories)

print("⚖️ Distribuzione del peso per categorie:")
for category, count in weight_distribution.items():
    print(f"{category}: {count} persone")
'''

def analyze_data(cur):
    # 1. Distribuzione dei colori occhi con SQL
    print("👁️ Distribuzione colori occhi:")
    cur.execute("""
        SELECT eye_color, COUNT(*)
        FROM people
        GROUP BY eye_color;
    """)
    for color, count in cur.fetchall():
        print(f"{color}: {count}")

    # 2. Distribuzione dei colori capelli con SQL
    print("\n💇 Distribuzione colori capelli:")
    cur.execute("""
        SELECT hair_color, COUNT(*)
        FROM people
        GROUP BY hair_color;
    """)
    for color, count in cur.fetchall():
        print(f"{color}: {count}")

    # 3. Distribuzione del peso per categorie con SQL
    print("\n⚖️ Distribuzione del peso per categorie:")
    cur.execute("""
        SELECT
            CASE
                WHEN weight < 60 THEN 'Sottopeso'
                WHEN weight < 80 THEN 'Normopeso'
                ELSE 'Sovrappeso'
            END AS weight_category,
            COUNT(*) AS count
        FROM people
        GROUP BY weight_category;
    """)
    for category, count in cur.fetchall():
        print(f"{category}: {count} persone")

def plot_data(cur):
    # Leggi tutti i dati
    cur.execute("SELECT eye_color, hair_color, weight FROM people")
    rows = cur.fetchall()

    # 🔹 Separiamo le colonne
    eye_colors = [row[0] for row in rows]
    hair_colors = [row[1] for row in rows]
    weights = [row[2] for row in rows]

    # 🔹 Distribuzione dei colori occhi
    eye_distribution = Counter(eye_colors)
    # Grafico a barre
    plt.figure(figsize=(6,4))
    plt.bar(eye_distribution.keys(), eye_distribution.values(), color='skyblue')
    plt.title("Distribuzione colori occhi")
    plt.xlabel("Colore occhi")
    plt.ylabel("Numero di persone")
    plt.show()

    # 🔹 Distribuzione dei colori capelli
    hair_distribution = Counter(hair_colors)
    # Grafico a barre
    plt.figure(figsize=(6,4))
    plt.bar(hair_distribution.keys(), hair_distribution.values(), color='orange')
    plt.title("Distribuzione colori capelli")
    plt.xlabel("Colore capelli")
    plt.ylabel("Numero di persone")
    plt.show()

    # 🔹 Distribuzione dei pesi per categorie
    def categorize_weight(w):
        if w < 60:
            return "Sottopeso"
        elif w < 80:
            return "Normopeso"
        else:
            return "Sovrappeso"

    weight_categories = [categorize_weight(w) for w in weights]
    weight_distribution = Counter(weight_categories)

    # Grafico a barre per categorie
    plt.figure(figsize=(6,4))
    plt.bar(weight_distribution.keys(), weight_distribution.values(), color='green', edgecolor='black')
    plt.title("Distribuzione pesi per categorie")
    plt.xlabel("Categoria")
    plt.ylabel("Numero di persone")
    plt.show()

def plot_eye_hair_relationship(cur):
    """
    Crea un grafico a barre raggruppato più leggibile e professionale.
    """
    print("\n--- Creazione Grafico Bivariato Migliorato ---")
    
    query = """
        SELECT eye_color, hair_color, COUNT(*) AS count
        FROM people GROUP BY eye_color, hair_color ORDER BY eye_color, hair_color;
    """
    cur.execute(query)
    rows = cur.fetchall()

    if not rows:
        print("Nessun dato da plottare.")
        return

    # 1. Ristruttura i dati (come prima)
    data = {}
    for eye_color, hair_color, count in rows:
        if eye_color not in data:
            data[eye_color] = {}
        data[eye_color][hair_color] = count

    eye_colors = list(data.keys())
    hair_colors = sorted(list(set(hc for ec_data in data.values() for hc in ec_data.keys())))
    
    # --- MODIFICHE PRINCIPALI QUI ---
    
    # 2. Prepara le posizioni e le larghezze delle barre
    x = np.arange(len(eye_colors))  # Le posizioni dei GRUPPI sull'asse X
    width = 0.15  # Barre più strette
    n_hair_colors = len(hair_colors)
    
    fig, ax = plt.subplots(figsize=(14, 8)) # Grafico più grande

    # Calcola lo spostamento per ogni barra all'interno di un gruppo
    for i, hair_color in enumerate(hair_colors):
        # Calcola la posizione di ogni barra: la posizione del gruppo + uno spostamento
        position = x - (width * (n_hair_colors - 1) / 2) + (i * width)
        
        counts = [data[ec].get(hair_color, 0) for ec in eye_colors]
        rects = ax.bar(position, counts, width, label=hair_color)
        
        # Aggiungi etichette con una dimensione del font più piccola
        ax.bar_label(rects, padding=3, fontsize=8)

    # 3. Aggiungi etichette e titolo
    ax.set_ylabel('Numero di Persone')
    ax.set_title('Distribuzione Colore Capelli per Colore Occhi', fontsize=16)
    ax.set_xticks(x, eye_colors) # Posiziona le etichette al centro dei gruppi
    ax.legend(title='Colore Capelli')
    ax.yaxis.grid(True, linestyle='--', alpha=0.6) # Aggiunge una griglia per leggibilità
    
    # Aumenta il limite dell'asse Y per dare più spazio alle etichette
    ax.set_ylim(0, max(c for ec_data in data.values() for c in ec_data.values()) * 1.15)
    
    fig.tight_layout() # Ottimizza gli spazi
    plt.show()

def main():
    """Funzione principale che esegue l'intero script."""
    conn = None # Inizializziamo la connessione a None
    try:
        # Passaggio 1: Connessione al DB
        conn, cur = connect_to_db()
        
        # Passaggio 2: Popolamento (se necessario)
        #populate_database_if_empty(cur, conn)
        
        # Passaggio 3: Analisi dei dati
        analyze_data(cur)
        
        # Passaggio 4: Plot dei dati
        plot_data(cur)
        
        # Per la bivariate
        plot_eye_hair_relationship(cur)
        
        
        
    except sqlite3.Error as e:
        print(f"❌ Errore del database: {e}")
    finally:
        # Passaggio 4: Chiusura della connessione (molto importante!)
        if conn:
            conn.close()
            print("\n🔌 Connessione al database chiusa.")

# Questo blocco viene eseguito solo quando lo script viene lanciato direttamente
if __name__ == "__main__":
    main()