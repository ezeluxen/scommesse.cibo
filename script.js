
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyArsk0jIctkp21ZmkQ5PckYPjo6K7jBGP4",
    authDomain: "scommesse-cibo.firebaseapp.com",
    databaseURL: "https://scommesse-cibo-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "scommesse-cibo",
    storageBucket: "scommesse-cibo.firebasestorage.app",
    messagingSenderId: "1012534919978",
    appId: "1:1012534919978:web:f856aa464c5815e5b85453",
    measurementId: "G-GJDXFJCVBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let currentRound = 1;

function updateRoundIndicator() {
    document.getElementById("roundIndicator").innerText = `Ronda: ${currentRound}`;
}

function savePrediction(playerName, portata, bevanda, dessert) {
    const newPredictionRef = push(ref(database, `predictions/round${currentRound}`));
    set(newPredictionRef, {
        playerName,
        portata,
        bevanda,
        dessert
    });
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

    savePrediction(playerName, portata, bevanda, dessert || "Nessun dessert");
    document.getElementById("gameForm").reset();
}

function readPredictions() {
    const predictionsRef = ref(database, `predictions/round${currentRound}`);
    onValue(predictionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateResults(data);
        }
    });
}

function readRoundStatus() {
    const roundRef = ref(database, `rounds/round${currentRound}`);
    onValue(roundRef, (snapshot) => {
        const roundData = snapshot.val();
        if (roundData && roundData.finished) {
            displayRoundResults(roundData); // Muestra los resultados al finalizar el turno
        }
    });
}

function displayRoundResults(roundData) {
    const resultsTableBody = document.getElementById("resultsTableBody");
    resultsTableBody.innerHTML = "";

    const correctAnswersRow = `<tr>
        <td colspan="5">Risultati della Ronda ${currentRound}</td>
    </tr>`;
    resultsTableBody.innerHTML += correctAnswersRow;

    document.getElementById("correctAnswer").innerText = `
        Portata: ${roundData.portataCorrect}, Bevanda: ${roundData.bevandaCorrect}, Dessert: ${roundData.dessertCorrect || "Nessun dessert"}
    `;

    document.getElementById("tableResults").style.display = "block";
}

function endRound() {
    const portataCorrect = prompt("Inserisci la portata principale corretta:");
    const bevandaCorrect = prompt("Inserisci la bevanda corretta:");
    const dessertCorrect = prompt("Inserisci il dessert corretto (opzionale):");

    const roundData = {
        portataCorrect,
        bevandaCorrect,
        dessertCorrect,
        finished: true
    };

    // Guarda el estado del turno en Firebase
    set(ref(database, `rounds/round${currentRound}`), roundData).then(() => {
        console.log("Turno finalizado correctamente.");
    }).catch((error) => {
        console.error("Error al finalizar el turno:", error);
    });

    // Pasa al siguiente turno localmente
    currentRound++;
    updateRoundIndicator();
}

function updateResults(data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<h3>Giocatori che hanno scommesso:</h3>";

    Object.values(data).forEach(prediction => {
        resultsDiv.innerHTML += `<p>${prediction.playerName} ha completato la scommessa.</p>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gameForm");
    const endRoundButton = document.getElementById("endRoundButton");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitPrediction();
    });

    endRoundButton.addEventListener("click", endRound);

    updateRoundIndicator();
    readPredictions();
    readRoundStatus(); // Escucha el estado del turno
});
