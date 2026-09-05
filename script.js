/*
Plan:
Passwort aus id="passwordInput" holen und als Variable speichern
Wenn der nutzer is in einem Testfeld eingibt, sollen die eingaben live mit dem gesetzten Passwort verglichen werden.
Wenn der nutzer einen Fehler macht, wird das feld rot, auch im Hintergrund. Wenn das Richitge passwort drinnen steht, blinkt es kurz grün und leert sich autopmatisch.
Die Zeit wird immer live gemessen und die Fehlerquote live angezeigt (1 Fehler = 1 Falscher versuch, nicht 1 falsches Zeichen).
Der einzige Unterschied zwischen test 1 und 2 is, dass man in test 1 das passwort sieht und in test 2 nicht.

			<div class="test1">
				<h1>Tippe dein Passwort Schnell</h1>
				<input type="text" id="test1_txt" placeholder="Hier dein Passwort eingeben">
				<p class="info">Tippe dein Passwort so schnell wie möglich. Du kannst es auch blind tippen.</p>
				<p class="info" id="statistics1">Fehlerquote: X%<br>Tempo: X PPM (passwords per minute)</p>
				<p class="info" id="bewertung1">Du kannst es X tippen</p>
			</div>
			<div class="test2">
				<h1>Tippe dein Passwort Schnell</h1>
				<input type="password" id="test2_txt" placeholder="Hier dein Passwort eingeben">
				<p class="info">Tippe dein Passwort blind so schnell wie möglich. Du kannst es auch blind tippen.</p>
				<p class="info" id="statistics2">Fehlerquote: X%<br>Tempo: X PPM (passwords per minute)</p>
				<p class="info" id="bewertung2">Du kannst es X tippen</p>
			</div>

WICHTIG: Der cursor muss aktive im textfeld bleiben, auch wenn es sich leert oder fehler gibt, um ein schnelles durchgängiges training zu ermöglihen ohne unterbrechungen.
*/
//Setup
const pswdIp = document.getElementById("passwordInput");
const t1Ip = document.getElementById("test1_txt");
const t2Ip = document.getElementById("test2_txt");
const reset = document.getElementById("resetButton");
const sts = document.getElementById("statshow");
let pswd = pswdIp.value;
let startTime1 = null;
let startTime2 = null;
let typedPwd1 = 0;
let typedPwd2 = 0;
let erroractive2 = false;
let erroractive1 = false;
let error1 = 0;
let error2 = 0;
let totalErrors1 = 0;
let totalErrors2 = 0;
let rating1 = "";
let rating2 = "";
let activetrain = 0; // 1 = test1, 2 = test2
let stats1 = [];
let stats2 = [];

function updateLiveStats(testNumber) {
	stsupd(testNumber);
}

function completeRun(testNumber, duration) {
	const stats = testNumber === 1 ? stats1 : stats2;
	const totalErrors = testNumber === 1 ? totalErrors1 : totalErrors2;
	const ppm = duration > 0 ? 60 / duration : 0;
	const errorRate = (totalErrors / (totalErrors + stats.length + 1)) * 100;
	stats.push({
		ppm: ppm,
		errorRate: errorRate
	});
	stsupd();
}
// Passwort setzen
pswdIp.addEventListener("input", function() {
	pswd = pswdIp.value;
})
// Reset button
reset.addEventListener("click", function() {
	pswdIp.value = "";
	t1Ip.value = "";
	t2Ip.value = "";
	pswd = "";
	startTime1 = null;
	startTime2 = null;
	typedPwd1 = 0;
	typedPwd2 = 0;
	erroractive1 = false;
	erroractive2 = false;
	error1 = 0;
	error2 = 0;
	totalErrors1 = 0;
	totalErrors2 = 0;
	activetrain = 0;
	stats1 = [];
	stats2 = [];
	t1Ip.style.backgroundColor = "";
	t2Ip.style.backgroundColor = "";
	stsupd();
})
//Test 1
t1Ip.addEventListener("input", function() {
	if (pswd == "") {
		alert("Bitte setze zuerst ein Passwort in das obere Feld, bevor du den Test startest.");
		t1Ip.value = "";
		return;
	}
	if (startTime1 === null) {
		startTime1 = new Date();
		startTime2 = null;
		typedPwd1 = 0;
		typedPwd2 = 0;
		error1 = 0;
		erroractive1 = false;
		activetrain = 1;
	};
	if (t1Ip.value === pswd && pswd !== "") {
		const duration = (new Date() - startTime1) / 1000;
		t1Ip.style.backgroundColor = "green";
		t1Ip.value = "";
		typedPwd1++;
		completeRun(1, duration);
		startTime1 = null;
	}
	// Auch sehen wenn das richtige passwort noch eingegeben wird, aber noch nicht fertig ist
	else if (pswd.startsWith(t1Ip.value)) {
		console.log("noch nicht fertig");
		t1Ip.style.backgroundColor = "white";
		erroractive1 = false;
	} else {
		if (!erroractive1) {
			t1Ip.style.backgroundColor = "red";
			erroractive1 = true;
			error1++;
			totalErrors1++;
		} else {
			t1Ip.style.backgroundColor = "red";
		}
	}
	updateLiveStats(1);
})
//Test 2
t2Ip.addEventListener("input", function() {
	if (pswd == "") {
		alert("Bitte setze zuerst ein Passwort in das obere Feld, bevor du den Test startest.");
		t2Ip.value = "";
		return;
	}
	if (startTime2 === null) {
		startTime2 = new Date();
		startTime1 = null;
		typedPwd1 = 0;
		typedPwd2 = 0;
		error2 = 0;
		erroractive2 = false;
		activetrain = 2;
	};
	if (t2Ip.value === pswd && pswd !== "") {
		const duration = (new Date() - startTime2) / 1000;
		t2Ip.style.backgroundColor = "green";
		t2Ip.value = "";
		typedPwd2++;
		completeRun(2, duration);
		startTime2 = null;
	}
	// Auch sehen wenn das richtige passwort noch eingegeben wird, aber noch nicht fertig ist
	else if (pswd.startsWith(t2Ip.value)) {
		console.log("noch nicht fertig");
		t2Ip.style.backgroundColor = "white";
		erroractive2 = false;
	} else {
		if (!erroractive2) {
			t2Ip.style.backgroundColor = "red";
			erroractive2 = true;
			error2++;
			totalErrors2++;
		} else {
			t2Ip.style.backgroundColor = "red";
		}
	}
	updateLiveStats(2);
})
// =========================================================
// Statistics
// =========================================================
function stsupd(testNumber = activetrain) {
	const activeStats = testNumber === 1 ? stats1 : stats2;
	const inactiveStats = activetrain === 1 ? stats2 : stats1;
	const activeErrors = testNumber === 1 ? totalErrors1 : totalErrors2;
	const inactiveErrors = activetrain === 1 ? totalErrors2 : totalErrors1;
	if (activetrain === 0) {
		sts.innerHTML = "---";
		return;
	}
	const averagePpm = activeStats.length > 0 ? activeStats.reduce((sum, stat) => sum + stat.ppm, 0) / activeStats.length : 0;
	const totalAttempts = activeStats.length + activeErrors;
	const errorRate = totalAttempts > 0 ? (activeErrors / totalAttempts) * 100 : 0;
	let ratingText = "";
	if (averagePpm < 8 || errorRate > 45) {
		ratingText = "Schlecht";
	} else if (averagePpm < 21 || errorRate > 22) {
		ratingText = "Gut";
	} else {
		ratingText = "SEHR GUT";
	}
	// ==========================================
	// Anzeige
	// ==========================================
	let html = "";
	let inactiveHtml = "";
	if (inactiveStats.length > 0) {
		const inactiveAveragePpm = inactiveStats.reduce((sum, stat) => sum + stat.ppm, 0) / inactiveStats.length;
		const inactiveAttempts = inactiveStats.length + inactiveErrors;
		const inactiveErrorRate = inactiveAttempts > 0 ? (inactiveErrors / inactiveAttempts) * 100 : 0;
		inactiveHtml = `Nicht Aktiver Test ${activetrain === 1 ? 2 : 1}: Fehlerquote: ${inactiveErrorRate.toFixed(2)}%, PPM: ${inactiveAveragePpm.toFixed(2)}<br><br>`;
	}
	// ==========================================
	// Aktive Statistik
	// ==========================================
	activeStats.forEach((stat, index) => {
		const run = index + 1;
		// Nur 1, 5 und danach jeden 10. Durchlauf anzeigen
		if (run === 1 || run === 5 || run % 10 === 0) {
			html += `
                <div class="stat-entry">
                    <strong>Durchlauf ${run}</strong>
                    <span>
                        ${stat.ppm.toFixed(2)} PPM
                    </span>
                    <span>
                        ${stat.errorRate.toFixed(2)} % Fehler
                    </span>
                </div>
            `;
		}
	});
	// Ausgabe
	html = `${inactiveHtml}Aktiver Test: ${activetrain === 1 ? 1 : 2}<br>Fehlerquote: ${errorRate.toFixed(2)}%<br>Tempo: ${averagePpm.toFixed(2)} PPM (passwords per minute)<br><br>Du kannst es ${ratingText} tippen<hr>${html}`;
	sts.innerHTML = html;
}
