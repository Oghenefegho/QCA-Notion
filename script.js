// Grade values and colors for chart
const grades = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const gradeColors = { A: '#66c2a5', B: '#fc8d62', C: '#8da0cb', D: '#e78ac3', F: '#a6d854' };

// Counters for semesters and years
let semesterCounter = 1;
let yearCounter = 1;

// Maximum modules per semester and maximum semesters per year
const maxModulesPerSemester = 5;
const maxSemestersPerYear = 2;

// Object to store grade data for chart
let gradesData = {};

// Event listener to load previous calculations when the page loads
document.addEventListener('DOMContentLoaded', (event) => {
    loadPreviousCalculations();
});

// Function to add a new semester
function addSemester() {
    // Check if we need to start a new year
    if (semesterCounter > maxSemestersPerYear * yearCounter) {
        yearCounter++;
        semesterCounter = (yearCounter - 1) * maxSemestersPerYear + 1;
    }

    // Create a new semester div
    const semesterDiv = document.createElement('div');
    semesterDiv.id = `semester-${semesterCounter}`;
    semesterDiv.classList.add('semester');
    semesterDiv.innerHTML = `
        <h2>Year ${yearCounter}, Semester ${semesterCounter % maxSemestersPerYear === 0 ? maxSemestersPerYear : semesterCounter % maxSemestersPerYear}</h2>
        <div id="modules-${semesterCounter}"></div>
        <input type="number" placeholder="Year (1-4)" id="year-${semesterCounter}" min="1" max="4" value="${yearCounter}" required readonly />
        <button type="button" onclick="addModule(${semesterCounter})">Add Module</button>
    `;

    // Append the new semester div to the container
    document.getElementById('semesters-container').appendChild(semesterDiv);
    semesterCounter++;
}

// Function to add a new module to a semester
function addModule(semester) {
    const semesterId = `modules-${semester}`;
    const moduleCounter = document.getElementById(semesterId).children.length;

    // Limit the number of modules per semester
    if (moduleCounter >= maxModulesPerSemester) {
        alert('You can only have a maximum of 5 modules per semester.');
        return;
    }

    // Create a new module div
    const moduleDiv = document.createElement('div');
    moduleDiv.id = `module-${semester}-${moduleCounter + 1}`;
    moduleDiv.classList.add('module');
    moduleDiv.innerHTML = `
        <input type="text" placeholder="Module Name" id="module-name-${semester}-${moduleCounter + 1}" />
        <input type="text" placeholder="Grade (A, B, C, D, F)" id="grade-${semester}-${moduleCounter + 1}" />
        <input type="number" placeholder="Percentage (0-100)" id="percentage-${semester}-${moduleCounter + 1}" min="0" max="100" />
        <input type="color" id="color-${semester}-${moduleCounter + 1}" value="#000000">
    `;

    // Append the new module div to the semester div
    document.getElementById(semesterId).appendChild(moduleDiv);
}

// Function to save a grade to Notion (replace the URL with your backend endpoint)
function saveGradeToNotion(year, grade, moduleName, percentage) {
    return fetch('https://your-backend-server.com/save-grade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ year, grade, moduleName, percentage })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Error saving grade');
        }
        return response.json();
    });
}

// Function to calculate QCA and render the results
function calculateQCA() {
    let totalPoints = 0;
    let totalWeight = 0;
    const yearWeights = { 1: 0, 2: 1, 3: 1, 4: 2 }; // Year weight mapping
    gradesData = { labels: [], datasets: [] }; // Reset grades data for chart

    // Loop through each semester to calculate QCA
    for (let i = 1; i < semesterCounter; i++) {
        const yearInput = document.getElementById(`year-${i}`).value;
        const semesterId = `modules-${i}`;
        const modules = document.getElementById(semesterId).children;

        // Loop through each module in the semester
        for (let j = 0; j < modules.length; j++) {
            const moduleName = document.getElementById(`module-name-${i}-${j + 1}`).value;
            const gradeInput = document.getElementById(`grade-${i}-${j + 1}`).value.trim().toUpperCase();
            const percentageInput = parseInt(document.getElementById(`percentage-${i}-${j + 1}`).value);

            // Validate inputs and calculate total points and weight
            if (yearInput && grades[gradeInput] !== undefined && percentageInput >= 0 && percentageInput <= 100) {
                const year = parseInt(yearInput);
                const gradeValue = grades[gradeInput];
                totalPoints += (gradeValue * yearWeights[year] * percentageInput) / 100;
                totalWeight += (yearWeights[year] * percentageInput) / 100;

                // Add module data to gradesData for chart
                if (!gradesData.labels.includes(moduleName)) {
                    gradesData.labels.push(moduleName);
                    gradesData.datasets.push({ label: moduleName, data: [], backgroundColor: [] });
                }

                const moduleIndex = gradesData.labels.indexOf(moduleName);
                gradesData.datasets[moduleIndex].data.push(gradeValue);
                gradesData.datasets[moduleIndex].backgroundColor.push(gradeColors[gradeInput]);

                // Save grade to Notion
                saveGradeToNotion(year, gradeInput, moduleName, percentageInput);
            }
        }
    }

    // Calculate QCA
    const qca = totalPoints / totalWeight;
    let honors = "Fail";
    if (qca >= 2.0) honors = "Third class honours";
    if (qca >= 2.6) honors = "Second class, grade 2 (2.2)";
    if (qca >= 3.0) honors = "Second class, grade 1 (2.1)";
    if (qca >= 3.4) honors = "First class honours";

    // Display QCA result
    document.getElementById('result').innerText = `Overall QCA is ${qca.toFixed(2)}, ${honors}`;
    
    // Render the grade chart
    renderChart();

    // Save the current calculation
    saveCalculation({ qca, honors, gradesData });
}

// Function to render the grade chart
function renderChart() {
    const ctx = document.getElementById('grade-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: gradesData,
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Function to save the current calculation to localStorage
function saveCalculation(calculation) {
    const calculations = JSON.parse(localStorage.getItem('calculations')) || [];
    calculations.push(calculation);
    localStorage.setItem('calculations', JSON.stringify(calculations));
}

// Function to load previous calculations from localStorage
function loadPreviousCalculations() {
    const calculations = JSON.parse(localStorage.getItem('calculations')) || [];
    calculations.forEach(calculation => {
        // Display previous calculations (customize as needed)
        console.log(`QCA: ${calculation.qca}, Honors: ${calculation.honors}`);
    });
}
