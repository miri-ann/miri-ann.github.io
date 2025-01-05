function classifyDifferentialEquation(equation) {
    let classification = {
        dependentVariable: '',
        independentVariable: '',
        type: '',
        order: 0,
        degree: 0,
        linearity: ''
    };

    // Helper function to convert numbers to ordinals
    function toOrdinal(number) {
        const ordinals = ["first", "second", "third", "fourth", "fifth"];
        return number > 0 && number <= ordinals.length ? ordinals[number - 1] : `${number}th`;
    }

    // Normalize the input by trimming whitespace and converting to lowercase
    equation = equation.trim().toLowerCase();

    // Determine dependent and independent variables
    if (equation.match(/d\w\/d\w/g)) {
        // Find all derivative patterns like 'dy/dx' or 'dx/dy'
        const matches = equation.match(/d(\w)\/d(\w)/g);

        if (matches) {
            const dependentVariables = new Set(); // To store unique dependent variables
            const independentVariables = new Set(); // To store unique independent variables

            matches.forEach(match => {
                const [, dependent, independent] = match.match(/d(\w)\/d(\w)/); // Extract variables
                if (dependent === 'x' || dependent === 'y') dependentVariables.add(dependent);
                if (independent === 'x' || independent === 'y') independentVariables.add(independent);
            });

            // Determine how to classify based on the number of variables found
            classification.dependentVariable = dependentVariables.size === 1
                ? Array.from(dependentVariables)[0]
                : Array.from(dependentVariables).join(', ');

            classification.independentVariable = independentVariables.size === 1
                ? Array.from(independentVariables)[0]
                : Array.from(independentVariables).join(', ');
        }
    } else {
        // Fallback for equations without derivatives
        const hasX = equation.includes('x');
        const hasY = equation.includes('y');

        if (hasX && hasY) {
            classification.dependentVariable = 'x, y';
            classification.independentVariable = 'x, y';
        } else if (hasY) {
            classification.dependentVariable = 'y';
            classification.independentVariable = 'x'; // Assume x as independent by default
        } else if (hasX) {
            classification.dependentVariable = 'x';
            classification.independentVariable = 'y'; // Assume y as independent by default
        } else {
            classification.dependentVariable = '';
            classification.independentVariable = '';
        }
    }

    // Classify by type
    if (equation.match(/d\w\/d\w/g)) {
        classification.type = 'Ordinary Differential Equation (ODE)';
    } else if (equation.match(/∂|partial/)) {
        classification.type = 'Partial Differential Equation (PDE)';
    } else {
        classification.type = 'Ordinary Differential Equation (ODE)';
    }


   // Determine the order and degree
const derivativeTerms = equation.match(/\(d\^\d+y\/d\w\^\d+\)\^\d+|d\^\d+y\/d\w\^\d+|\(dy\/dx\)\^\d+|dy\/dx/g);

if (derivativeTerms) {
    let maxOrder = 0; // Highest derivative order
    let degree = 1;   // Degree of the equation

    derivativeTerms.forEach(term => {
        // Extract the order of the derivative
        let order = 1; // Default to first-order
        const orderMatch = term.match(/d\^(\d+)/); // Matches d^n
        if (orderMatch) {
            order = parseInt(orderMatch[1]);
        }

        // Check if this term defines the highest order
        if (order > maxOrder) {
            maxOrder = order;

            // Reset degree to the degree of this term
            const degreeMatch = term.match(/\)\^(\d+)/); // Matches exponent outside parentheses
            degree = degreeMatch ? parseInt(degreeMatch[1]) : 1;
        } else if (order === maxOrder) {
            // Update degree if another term with the same maxOrder has a higher exponent
            const degreeMatch = term.match(/\)\^(\d+)/);
            if (degreeMatch) {
                degree = Math.max(degree, parseInt(degreeMatch[1]));
            }
        }
    });

    // Debugging: Log results for verification
    console.log("Derivative Terms:", derivativeTerms);
    console.log("Max Order:", maxOrder);
    console.log("Degree for Max Order:", degree);

    classification.order = maxOrder;
    classification.degree = degree;
} else {
    classification.order = 0; // No derivatives found
    classification.degree = 1; // Default degree
}

    // Determine linearity
    const terms = equation.match(/([+-]?\s*\d*\s*[xy]?\^?\d*|\bdy\b|\bdx\b|\bdy\/dx\b)/g);
    let isLinearInX = true;
    let isLinearInY = true;

    if (terms) {
        terms.forEach(term => {
            // Check for non-linear terms involving x
            if (term.includes('x') && term.match(/x\^([2-9]|\d{2,})/)) {
                isLinearInX = false;
            }
            // Check for non-linear terms involving y
            if (term.includes('y') && term.match(/y\^([2-9]|\d{2,})/)) {
                isLinearInY = false;
            }
        });
    }

    if (!isLinearInX || !isLinearInY) {
        classification.linearity = 'Non-Linear';
    } else if (isLinearInX) {
        classification.linearity = 'Linear in x';
    } else if (isLinearInY) {
        classification.linearity = 'Linear in y';
    }

    // Convert order and degree to ordinals for display
    classification.order = classification.order > 0 ? toOrdinal(classification.order) : 'N/A';
    classification.degree = classification.degree > 0 ? toOrdinal(classification.degree) : 'N/A';

    return classification;
}

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    const equationInput = document.querySelector('input[name="equation"]');
    const equation = equationInput.value;
    const result = classifyDifferentialEquation(equation);

    // Display the result in a table
    const resultDiv = document.getElementById('result'); // Get the result display area
    resultDiv.innerHTML = `
        <table>
            <tr>
                <th>Property</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Dependent Variable</td>
                <td>${result.dependentVariable || 'N/A'}</td>
            </tr>
            <tr>
                <td>Independent Variable</td>
                <td>${result.independentVariable || 'N/A'}</td>
            </tr>
            <tr>
                <td>Type</td>
                <td>${result.type}</td>
            </tr>
            <tr>
                <td>Order</td>
                <td>${result.order}</td>
            </tr>
            <tr>
                <td>Degree</td>
                <td>${result.degree}</td>
            </tr>
            <tr>
                <td>Linearity</td>
                <td>${result.linearity}</td>
            </tr>
        </table>
    `;
}

// Attach the form submit event listener
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.classifier form');
    form.addEventListener('submit', handleFormSubmit);
});


// Growth and Decay Solver
function solveGrowthAndDecay() {
    const t0 = parseFloat(document.getElementById('t0-growth').value);
    const p0 = parseFloat(document.getElementById('p0-growth').value);
    const t1 = parseFloat(document.getElementById('t1-growth').value);
    const p1 = parseFloat(document.getElementById('p1-growth').value);
    const t_req = parseFloat(document.getElementById('t_req-growth').value);

    if (isNaN(t0) || isNaN(p0) || isNaN(t1) || isNaN(p1) || isNaN(t_req)) {
        alert("Please enter valid numeric values for all inputs.");
        return;
    }

    const k = Math.log(p1 / p0) / (t1 - t0);
    const predictedP = p0 * Math.exp(k * (t_req - t0));

    const solutionDiv = document.getElementById('solution-growth');
    const solutionContent = document.getElementById('solution-growth-content');
    solutionDiv.style.display = 'block';
    solutionContent.innerHTML = `
        <strong>Given:</strong><br>
        t<sub>0</sub> = ${t0}, P<sub>0</sub> = ${p0}, t<sub>1</sub> = ${t1}, P<sub>1</sub> = ${p1}, t<sub>req</sub> = ${t_req}<br><br>
        
        <strong>Step 1: Calculate Growth/Decay Rate (k):</strong><br>
        Formula: k = ln(P<sub>1</sub> / P<sub>0</sub>) / (t<sub>1</sub> - t<sub>0</sub>)<br>
        Substitution: k = ln(${p1} / ${p0}) / (${t1} - ${t0})<br>
        Calculation: k = ${k.toFixed(4)}<br><br>
        
        <strong>Step 2: Predict Population at t<sub>req</sub>:</strong><br>
        Formula: P(t) = P<sub>0</sub> * e<sup>k(t - t<sub>0</sub>)</sup><br>
        Substitution: P(${t_req}) = ${p0} * e<sup>${k.toFixed(4)}(${t_req} - ${t0})</sup><br>
        Calculation: P(${t_req}) = ${predictedP.toFixed(4)}<br><br>
        
        <strong>Final Answer:</strong> The predicted population at t<sub>req</sub> = ${t_req} is aproximately <strong>${predictedP.toFixed(4)}</strong>.
    `;
}    

// Newton's Law of Cooling Solver
function solveNewtonCooling() {
    const tm = parseFloat(document.getElementById('tm').value);
    const t0 = parseFloat(document.getElementById('t0-newton').value);
    const t_initial = parseFloat(document.getElementById('t_initial').value);
    const t1 = parseFloat(document.getElementById('t1-newton').value);
    const t1_temp = parseFloat(document.getElementById('t1_temp').value);
    const t_req = parseFloat(document.getElementById('t_req-newton').value);

    if (isNaN(tm) || isNaN(t0) || isNaN(t_initial) || isNaN(t1) || isNaN(t1_temp) || isNaN(t_req)) {
        alert("Please enter valid numeric values for all inputs.");
        return;
    }

    const c = t_initial - tm;
    const k = Math.log((t1_temp - tm) / c) / (t1 - t0);
    const predictedTemp = tm + c * Math.exp(k * (t_req - t0));

    const solutionDiv = document.getElementById('solution-newton');
    const solutionContent = document.getElementById('solution-newton-content');
solutionDiv.style.display = 'block';
solutionContent.innerHTML = `
    <strong>Given:</strong><br>
    T<sub>m</sub> = ${tm}, T<sub>0</sub> = ${t_initial}, t<sub>1</sub> = ${t1}, T<sub>1</sub> = ${t1_temp}, t<sub>req</sub> = ${t_req}<br><br>
    
    <strong>Step 1: Calculate Cooling/Heating Rate (k):</strong><br>
    Formula: k = ln((T<sub>1</sub> - T<sub>m</sub>) / (T<sub>0</sub> - T<sub>m</sub>)) / (t<sub>1</sub> - t<sub>0</sub>)<br>
    Substitution: k = ln((${t1_temp} - ${tm}) / (${t_initial} - ${tm})) / (${t1} - ${t0})<br>
    Calculation: k = ${k.toFixed(4)}<br><br>
    
    <strong>Step 2: Predict Temperature at t<sub>req</sub>:</strong><br>
    Formula: T(t) = T<sub>m</sub> + C * e<sup>k(t - t<sub>0</sub>)</sup><br>
    Substitution: T(${t_req}) = ${tm} + ${c} * e<sup>${k.toFixed(4)}(${t_req} - ${t0})</sup><br>
    Calculation: T(${t_req}) = ${predictedTemp.toFixed(4)}<br><br>
    
    <strong>Final Answer:</strong> The predicted temperature at t<sub>req</sub> = ${t_req} is <strong>${predictedTemp.toFixed(4)}</strong>.
`;

}

// Attach event listeners for the buttons
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('solve-growth').addEventListener('click', solveGrowthAndDecay);
    document.getElementById('solve-newton').addEventListener('click', solveNewtonCooling);
    document.getElementById('clear-growth').addEventListener('click', () => {
        document.getElementById('solution-growth').style.display = 'none';
    });
    document.getElementById('clear-newton').addEventListener('click', () => {
        document.getElementById('solution-newton').style.display = 'none';
    });
});

