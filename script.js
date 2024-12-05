
// script.js

let predictions = [];
let rounds = [];
let currentRound = 1;

function updateRoundIndicator() {
    document.getElementById("roundIndicator").innerText = `Ronda: ${currentRound}`;
}

function submitPrediction() {
    const playerName = document.getElementById("playerName").value;
    const portata = document.getElementById("portata").value;
    const bevanda = document.getElementById("bevanda").value;
    const dessert = document.getElementById("dessert").value;

    if (!playerName || !portata || !bevanda) {
        alert("Per favore, compila tutti i campi obbligatori!");
        return;
    }

    const playerPrediction = { playerName, portata, bevanda, dessert };
    predictions.push(playerPrediction);

    document.getElementById("gameForm").reset();
    updateResults();
}

function updateResults() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<h3>Giocatori che hanno scommesso:</h3>";

    predictions.forEach(prediction => {
        resultsDiv.innerHTML += `<p>${prediction.playerName} ha completato la scommessa.</p>`;
    });
}

function endRound() {
    if (predictions.length === 0) {
        alert("Nessuna scommessa fatta in questo turno!");
        return;
    }

    const portataCorrect = prompt("Inserisci la portata principale corretta:");
    const bevandaCorrect = prompt("Inserisci la bevanda corretta:");
    const dessertCorrect = prompt("Inserisci il dessert corretto (opzionale):");

    const resultsTableBody = document.getElementById("resultsTableBody");
    resultsTableBody.innerHTML = "";

    let roundDetails = {
        round: currentRound,
        correctAnswer: { portata: portataCorrect, bevanda: bevandaCorrect, dessert: dessertCorrect },
        results: []
    };

    predictions.forEach(prediction => {
        let points = 0;

        if (prediction.portata.toLowerCase() === portataCorrect.toLowerCase()) {
            points += 5;
        }

        if (prediction.bevanda.toLowerCase() === bevandaCorrect.toLowerCase()) {
            points += 3;
        }

        if (prediction.dessert && prediction.dessert.toLowerCase() === dessertCorrect.toLowerCase()) {
            points += 3;
        }

        if (
            prediction.portata.toLowerCase() === portataCorrect.toLowerCase() &&
            prediction.bevanda.toLowerCase() === bevandaCorrect.toLowerCase() &&
            prediction.dessert.toLowerCase() === dessertCorrect.toLowerCase()
        ) {
            points += 10;
        }

        roundDetails.results.push({ playerName: prediction.playerName, points });

        const row = `<tr>
            <td>${prediction.playerName}</td>
            <td>${prediction.portata}</td>
            <td>${prediction.bevanda}</td>
            <td>${prediction.dessert || "Nessun dessert"}</td>
            <td>${points}</td>
        </tr>`;
        resultsTableBody.innerHTML += row;
    });

    document.getElementById("correctAnswer").innerText = `
        Portata: ${portataCorrect}, Bevanda: ${bevandaCorrect}, Dessert: ${dessertCorrect || "Nessun dessert"}
    `;
    document.getElementById("tableResults").style.display = "block";

    rounds.push(roundDetails);
    updateHistoryDropdown();
    predictions = [];
    currentRound++;
    updateRoundIndicator();
}

function updateHistoryDropdown() {
    const dropdown = document.getElementById("historyDropdown");
    dropdown.innerHTML = '<option value="">Seleziona una ronda</option>';
    rounds.forEach((round, index) => {
        dropdown.innerHTML += `<option value="${index}">Ronda ${round.round}</option>`;
    });
}

function showRoundDetails() {
    const dropdown = document.getElementById("historyDropdown");
    const selectedIndex = dropdown.value;
    if (selectedIndex === "") {
        document.getElementById("historyDetails").innerHTML = "";
        return;
    }

    const round = rounds[selectedIndex];
    let details = `
        <h4>Ronda ${round.round}</h4>
        <p>Risposta corretta: Portata: ${round.correctAnswer.portata}, 
        Bevanda: ${round.correctAnswer.bevanda}, 
        Dessert: ${round.correctAnswer.dessert || "Nessun dessert"}</p>
        <table>
            <thead>
                <tr>
                    <th>Giocatore</th>
                    <th>Punti</th>
                </tr>
            </thead>
            <tbody>
    `;

    round.results.forEach(result => {
        details += `
            <tr>
                <td>${result.playerName}</td>
                <td>${result.points}</td>
            </tr>
        `;
    });

    details += "</tbody></table>";
    document.getElementById("historyDetails").innerHTML = details;
}
