// DLS 6.0 Engine

// Standard approximate decay constants for resources
const Z0 = [285, 260, 225, 190, 150, 110, 75, 45, 20, 7, 0];
const b = [0.035, 0.04, 0.045, 0.05, 0.06, 0.07, 0.08, 0.1, 0.15, 0.2, 0];
const G50 = 245;

/** Calculate resource % available given overs left and wickets lost */
function getResource(oversLeft, wicketsLost) {
    if (wicketsLost >= 10 || oversLeft <= 0) return 0;
    const w = Math.floor(wicketsLost);
    const maxZ = Z0[0] * (1 - Math.exp(-b[0] * 50));
    const z = Z0[w] * (1 - Math.exp(-b[w] * oversLeft));
    return (z / maxZ) * 100;
}

function parseOvers(oversStr) {
    if (!oversStr || isNaN(oversStr)) return 0;
    const val = parseFloat(oversStr);
    const fullOvers = Math.floor(val);
    const balls = Math.round((val - fullOvers) * 10);
    return fullOvers + (balls / 6);
}

function formatOvers(oversDecimal) {
    const full = Math.floor(oversDecimal);
    const balls = Math.round((oversDecimal - full) * 6);
    if (balls === 6) return (full + 1).toString();
    if (balls === 0) return full.toString();
    return `${full}.${balls}`;
}

// State
let t1Rows = 5;
let t2Rows = 5;
let currentCalculation = null;

// DOM
const ui = {
    matchTypeRadios: document.querySelectorAll('input[name="matchType"]'),
    customSettings: document.getElementById('customSettings'),
    customMatchOvers: document.getElementById('customMatchOvers'),
    customMinOvers: document.getElementById('customMinOvers'),
    t1StartOvers: document.getElementById('t1StartOvers'),
    t1Score: document.getElementById('t1Score'),
    t2StartOvers: document.getElementById('t2StartOvers'),
    t1TableBody: document.querySelector('#t1Table tbody'),
    t2TableBody: document.querySelector('#t2Table tbody'),
    addT1Row: document.getElementById('addT1Row'),
    addT2Row: document.getElementById('addT2Row'),
    t1TotalOvers: document.getElementById('t1TotalOvers'),
    t2TotalOvers: document.getElementById('t2TotalOvers'),
    targetScore: document.getElementById('targetScore'),
    penaltyRuns: document.getElementById('penaltyRuns'),
    calcBtn: document.getElementById('calculateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportOverBtn: document.getElementById('exportOverBtn'),
    exportBallBtn: document.getElementById('exportBallBtn')
};

function getMatchSettings() {
    let checked = document.querySelector('input[name="matchType"]:checked');
    if (checked.value === 'Custom') {
        return {
            overs: parseFloat(ui.customMatchOvers.value) || 40,
            min: parseFloat(ui.customMinOvers.value) || 15
        };
    }
    return {
        overs: parseFloat(checked.dataset.overs),
        min: parseFloat(checked.dataset.min)
    };
}

function applyMatchSettings() {
    let checked = document.querySelector('input[name="matchType"]:checked');
    if (checked.value === 'Custom') {
        ui.customSettings.style.display = 'flex';
    } else {
        ui.customSettings.style.display = 'none';
    }
    // Apply settings to the boxes regardless of the mode
    let settings = getMatchSettings();
    ui.t1StartOvers.value = settings.overs;
    ui.t2StartOvers.value = settings.overs;
    updateTotals();
}

// Initialization
function initGrid(tbody, numRows, team) {
    tbody.innerHTML = '';
    for (let i = 0; i < numRows; i++) {
        appendRow(tbody, team);
    }
}

function appendRow(tbody, team) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="number" step="0.1" min="0" class="o-bowled" placeholder=""></td>
        <td><input type="number" min="0" class="r-scored" placeholder=""></td>
        <td><input type="number" min="0" max="10" class="w-down" placeholder=""></td>
        <td><input type="number" step="0.1" min="0" class="o-lost" placeholder=""></td>
    `;
    // Add event listeners to automatically update totals when overs are lost
    const inputs = tr.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateTotals);
    });
    tbody.appendChild(tr);
}

// Update the green boxes for "total overs available"
function updateTotals() {
    let t1Overs = parseFloat(ui.t1StartOvers.value) || 0;
    ui.t1TableBody.querySelectorAll('tr').forEach(tr => {
        const lost = parseFloat(tr.querySelector('.o-lost').value) || 0;
        t1Overs -= lost;
    });
    ui.t1TotalOvers.textContent = Math.max(0, t1Overs).toFixed(0);

    let t2Overs = parseFloat(ui.t2StartOvers.value) || 0;
    ui.t2TableBody.querySelectorAll('tr').forEach(tr => {
        const lost = parseFloat(tr.querySelector('.o-lost').value) || 0;
        t2Overs -= lost;
    });
    ui.t2TotalOvers.textContent = Math.max(0, t2Overs).toFixed(0);
}

// Extract stoppages from table
function extractStoppages(tbody) {
    const stoppages = [];
    tbody.querySelectorAll('tr').forEach(tr => {
        const ob = tr.querySelector('.o-bowled').value;
        const w = tr.querySelector('.w-down').value;
        const ol = tr.querySelector('.o-lost').value;
        
        if (ob !== '' && w !== '' && ol !== '') {
            stoppages.push({
                oversBowled: parseOvers(ob),
                wicketsDown: parseInt(w),
                oversLost: parseOvers(ol)
            });
        }
    });
    return stoppages;
}

/** Calculate net resources using standard interruption model */
function getNetResources(stoppages, startingOvers) {
    let currentOversAvailable = startingOvers;
    let totalResourceLost = 0;

    for (let stop of stoppages) {
        if (stop.oversLost <= 0) continue;
        
        // Before interruption
        let oversLeftBefore = currentOversAvailable - stop.oversBowled;
        if (oversLeftBefore < 0) oversLeftBefore = 0;
        let resBefore = getResource(oversLeftBefore, stop.wicketsDown);
        
        // After interruption
        let oversLeftAfter = oversLeftBefore - stop.oversLost;
        if (oversLeftAfter < 0) oversLeftAfter = 0;
        let resAfter = getResource(oversLeftAfter, stop.wicketsDown);
        
        let lost = resBefore - resAfter;
        totalResourceLost += lost;
        
        currentOversAvailable -= stop.oversLost;
    }
    
    let startingResource = getResource(startingOvers, 0);
    return startingResource - totalResourceLost;
}

// Calculate DLS Target
function calculateTarget() {
    const t1FinalScoreStr = ui.t1Score.value;
    if (t1FinalScoreStr === '') {
        alert("Please enter Team 1's final score.");
        return;
    }
    const t1FinalScore = parseInt(t1FinalScoreStr);
    const penaltyRuns = parseInt(ui.penaltyRuns.value) || 0;
    
    const t1Start = parseFloat(ui.t1StartOvers.value) || 0;
    const t2Start = parseFloat(ui.t2StartOvers.value) || 0;

    const t1Stoppages = extractStoppages(ui.t1TableBody);
    const t2Stoppages = extractStoppages(ui.t2TableBody);

    const t1Res = getNetResources(t1Stoppages, t1Start);
    const t2Res = getNetResources(t2Stoppages, t2Start);
    
    const settings = getMatchSettings();
    let finalT2Overs = parseFloat(ui.t2TotalOvers.textContent) || 0;
    
    if (finalT2Overs > 0 && finalT2Overs < settings.min) {
        alert(`Match Abandoned: Team 2's overs (${finalT2Overs}) is below the minimum required (${settings.min}) for a valid result.`);
        ui.targetScore.textContent = 'ABND';
        ui.targetScore.style.fontSize = '2rem';
        return;
    } else {
        ui.targetScore.style.fontSize = '2.5rem';
    }

    let target = 0;
    if (t1Res === 0) {
        target = 0; // Edge case
    } else if (t2Res < t1Res) {
        target = Math.floor(t1FinalScore * (t2Res / t1Res)) + 1;
    } else if (t2Res === t1Res) {
        target = t1FinalScore + 1;
    } else {
        target = Math.floor(t1FinalScore + ((t2Res - t1Res) * G50 / 100)) + 1;
    }
    
    target += penaltyRuns;

    // UI Update
    ui.targetScore.textContent = target;
    
    // Pulse effect
    ui.targetScore.style.transform = "scale(1.1)";
    setTimeout(() => { ui.targetScore.style.transform = "scale(1)"; }, 200);

    // Save for export
    currentCalculation = { t1FinalScore, t1Res, t2Start, t2Stoppages, penaltyRuns };
}

// Export Par Scores
function generateParTableData(mode) {
    if (!currentCalculation) {
        alert("Please calculate the target first.");
        return null;
    }

    const { t1FinalScore, t1Res, t2Start, t2Stoppages, penaltyRuns } = currentCalculation;
    
    // Calculate final T2 overs available
    let t2FinalOvers = t2Start;
    t2Stoppages.forEach(s => t2FinalOvers -= s.oversLost);
    
    if (t2FinalOvers <= 0) {
        alert("No overs left for Team 2 to generate a table.");
        return null;
    }

    let data = [];
    const totalBalls = Math.floor(t2FinalOvers) * 6 + Math.round((t2FinalOvers % 1) * 10);
    
    // Par Score formula: Par = ... (same as target but without the +1)
    function calcPar(resourcesUsedByT2) {
        if (resourcesUsedByT2 < t1Res) {
            return Math.floor(t1FinalScore * (resourcesUsedByT2 / t1Res)) + penaltyRuns;
        } else if (resourcesUsedByT2 === t1Res) {
            return t1FinalScore + penaltyRuns;
        } else {
            return Math.floor(t1FinalScore + ((resourcesUsedByT2 - t1Res) * G50 / 100)) + penaltyRuns;
        }
    }

    const totalT2Res = getNetResources(t2Stoppages, t2Start); // Total resources T2 will have overall

    // Generate rows
    let maxOvers = mode === 'over' ? Math.ceil(t2FinalOvers) : t2FinalOvers;
    
    // Add 0 overs row
    let row0 = { overs: '0', oversRemaining: formatOvers(t2FinalOvers) };
    for (let w = 0; w < 10; w++) {
        let resourcesRemaining = getResource(t2FinalOvers, w);
        let resourcesUsed = totalT2Res - resourcesRemaining;
        row0[`w${w}`] = calcPar(resourcesUsed);
    }
    data.push(row0);

    let b = 1;
    while (true) {
        let oversBowled = b / 6;
        if (oversBowled > t2FinalOvers) break;
        
        if (mode === 'over' && b % 6 !== 0 && oversBowled !== t2FinalOvers) {
            b++; continue;
        }
        
        let oversRemaining = t2FinalOvers - oversBowled;
        let row = { overs: formatOvers(oversBowled), oversRemaining: formatOvers(oversRemaining) };
        
        for (let w = 0; w < 10; w++) {
            let resourcesRemaining = getResource(oversRemaining, w);
            let resourcesUsed = totalT2Res - resourcesRemaining;
            row[`w${w}`] = calcPar(resourcesUsed);
        }
        data.push(row);
        b++;
    }
    
    return data;
}

function openParScoreWindow(mode) {
    const data = generateParTableData(mode);
    if (!data) return;

    let titleText = `Table of ${mode === 'over' ? 'over-by-over' : 'ball-by-ball'} Par Scores`;
    let t1Start = parseFloat(ui.t1StartOvers.value) || 0;
    let t2Start = parseFloat(ui.t2StartOvers.value) || 0;
    let t1FinalScore = currentCalculation.t1FinalScore;
    
    let now = new Date();
    let dateStr = now.toDateString().substring(0, 10) + " " + now.toTimeString().substring(0, 8) + " BST " + now.getFullYear();

    let csv = `overs bowled,overs remaining,0 Wkts,1 Wkts,2 Wkts,3 Wkts,4 Wkts,5 Wkts,6 Wkts,7 Wkts,8 Wkts,9 Wkts\\n`;
    
    let tableHtml = `
        <table class="report-table">
            <thead>
                <tr>
                    <th rowspan="2">overs<br>bowled</th>
                    <th rowspan="2">overs<br>remaining</th>
                    <th colspan="10">wickets down</th>
                </tr>
                <tr>
                    <th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(r => {
        let rowCsv = [r.overs, r.oversRemaining];
        tableHtml += `<tr><td><strong>${r.overs}</strong></td><td><strong>${r.oversRemaining}</strong></td>`;
        for(let w=0; w<10; w++) {
            rowCsv.push(r[`w${w}`]);
            tableHtml += `<td>${r[`w${w}`]}</td>`;
        }
        tableHtml += `</tr>`;
        csv += rowCsv.join(",") + "\\n";
    });
    
    tableHtml += `</tbody></table>`;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>DLS 6.0: ${titleText}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 8px; 
                    background: #f0f0f0; 
                    color: black;
                }
                .window-content {
                    background: white;
                    border: 1px solid #ccc;
                    padding: 8px;
                }
                .header-bar { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 8px; 
                }
                .title { 
                    font-size: 16px; 
                    font-weight: bold; 
                }
                button { 
                    background: #f0f0f0; 
                    color: black; 
                    border: 1px solid #999; 
                    padding: 4px 12px; 
                    font-size: 12px; 
                    cursor: pointer; 
                }
                button:hover { background: #e5e5e5; }
                .report-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    text-align: center; 
                    font-size: 13px;
                }
                .report-table th, .report-table td { 
                    padding: 4px; 
                    border: 1px solid black; 
                }
                .report-table th { 
                    font-weight: bold; 
                }
                .footer-bar {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    margin-top: 4px;
                }
                .table-id { font-weight: bold; }
                
                @media print {
                    @page { margin: 0.5cm; }
                    button, .title { display: none !important; }
                    body { background: white; padding: 0; font-size: 10px !important; }
                    .window-content { border: none; padding: 0; margin: 0; }
                    .header-bar { display: none !important; }
                    .report-table { font-size: 10px !important; line-height: 1 !important; }
                    .report-table th, .report-table td { padding: 1px 2px !important; border: 1px solid black !important; }
                }
            </style>
        </head>
        <body>
            <div class="window-content">
                <div class="header-bar">
                    <button onclick="window.print()">print table</button>
                    <div class="title">${titleText}</div>
                    <button onclick="downloadCSV()">save table</button>
                </div>
                
                ${tableHtml}

                <div class="footer-bar">
                    <div class="table-id">TableID(dls6.0): ${t1Start}-${t1FinalScore}/${t2Start}</div>
                    <div>${dateStr}</div>
                </div>
            </div>
            <script>
                function downloadCSV() {
                    const csv = \`${csv}\`;
                    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "DLS_Par_Scores_${mode}.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            </script>
        </body>
        </html>
    `;

    const newWindow = window.open('', '_blank', 'width=800,height=900');
    if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    } else {
        alert("Please allow pop-ups to view the report window.");
    }
}

// Events
ui.addT1Row.addEventListener('click', () => { appendRow(ui.t1TableBody, 1); t1Rows++; });
ui.addT2Row.addEventListener('click', () => { appendRow(ui.t2TableBody, 2); t2Rows++; });
ui.t1StartOvers.addEventListener('input', updateTotals);
ui.t2StartOvers.addEventListener('input', updateTotals);
ui.calcBtn.addEventListener('click', calculateTarget);
ui.exportOverBtn.addEventListener('click', () => openParScoreWindow('over'));
ui.exportBallBtn.addEventListener('click', () => openParScoreWindow('ball'));

ui.matchTypeRadios.forEach(r => r.addEventListener('change', applyMatchSettings));
ui.customMatchOvers.addEventListener('input', () => {
    ui.t1StartOvers.value = ui.customMatchOvers.value;
    ui.t2StartOvers.value = ui.customMatchOvers.value;
    updateTotals();
});

ui.resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.stoppage-table input').forEach(i => i.value = '');
    ui.t1Score.value = '';
    ui.penaltyRuns.value = 0;
    ui.targetScore.textContent = '--';
    initGrid(ui.t1TableBody, 5, 1);
    initGrid(ui.t2TableBody, 5, 2);
    applyMatchSettings();
});

// Boot
window.addEventListener('DOMContentLoaded', () => {
    initGrid(ui.t1TableBody, 5, 1);
    initGrid(ui.t2TableBody, 5, 2);
    applyMatchSettings();
});
