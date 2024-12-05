
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

function updateResults(data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<h3>Giocatori che hanno scommesso:</h3>";

    Object.values(data).forEach(prediction => {
        resultsDiv.innerHTML += `<p>${prediction.playerName} ha completato la scommessa.</p>`;
    });
}

function endRound() {
    const portataCorrect = prompt("Inserisci la portata principale corretta:");
    const bevandaCorrect = prompt("Inserisci la bevanda corretta:");
    const dessertCorrect = prompt("Inserisci il dessert corretto (opzionale):");

    const predictionsRef = ref(database, `predictions/round${currentRound}`);
    onValue(predictionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            calculateScores(data, portataCorrect, bevandaCorrect, dessertCorrect);
        }
    });

    currentRound++;
    updateRoundIndicator();
}

function calculateScores(data, portataCorrect, bevandaCorrect, dessertCorrect) {
    const resultsTableBody = document.getElementById("resultsTableBody");
    resultsTableBody.innerHTML = "";

    Object.values(data).forEach(prediction => {
        let points = 0;

        if (prediction.portata.toLowerCase() === portataCorrect.toLowerCase()) points += 5;
        if (prediction.bevanda.toLowerCase() === bevandaCorrect.toLowerCase()) points += 3;
        if (prediction.dessert && prediction.dessert.toLowerCase() === dessertCorrect.toLowerCase()) points += 3;

        const row = `<tr>
            <td>${prediction.playerName}</td>
            <td>${prediction.portata}</td>
            <td>${prediction.bevanda}</td>
            <td>${prediction.dessert || "Nessun dessert"}</td>
            <td>${points}</td>
        </tr>`;
        resultsTableBody.innerHTML += row;
    });

    document.getElementById("tableResults").style.display = "block";
    document.getElementById("correctAnswer").innerText = `
        Portata: ${portataCorrect}, Bevanda: ${bevandaCorrect}, Dessert: ${dessertCorrect || "Nessun dessert"}
    `;
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
});
