document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const addMemberBtn = document.querySelector('.addMember');
    const calculateBtn = document.querySelector('.calculate');
    const tableBody = document.querySelector('.mainTable tbody');
    const resultsDiv = document.getElementById('results');

    // Add member functionality
    addMemberBtn.addEventListener('click', function() {
        const newRow = tableBody.insertRow();
        
        // Name cell
        const nameCell = newRow.insertCell(0);
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'inputName';
        nameInput.placeholder = 'Input Your Name';
        nameCell.appendChild(nameInput);
        
        // Meal cell
        const mealCell = newRow.insertCell(1);
        const mealInput = document.createElement('input');
        mealInput.type = 'number';
        mealInput.className = 'inputMeal';
        mealInput.placeholder = '00';
        mealCell.appendChild(mealInput);
        
        // Bazar cell
        const bazarCell = newRow.insertCell(2);
        const bazarInput = document.createElement('input');
        bazarInput.type = 'number';
        bazarInput.className = 'inputBazar';
        bazarInput.placeholder = '00.00';
        bazarInput.setAttribute('oninput', 'validateInput(this)');
        bazarCell.appendChild(bazarInput);
    });

    // Calculate functionality
    calculateBtn.addEventListener('click', function() {
        const rows = tableBody.querySelectorAll('tr');
        const members = [];
        
        // Validate if there are members
        if (rows.length === 0) {
            resultsDiv.textContent = 'Please add at least one member.';
            return;
        }
        
        // Collect member data
        for (let row of rows) {
            const name = row.querySelector('.inputName').value.trim();
            const meal = parseFloat(row.querySelector('.inputMeal').value) || 0;
            const bazar = parseFloat(row.querySelector('.inputBazar').value) || 0;
            
            if (!name) {
                resultsDiv.textContent = 'Please enter names for all members.';
                return;
            }
            
            members.push({ name, meal, bazar });
        }
        
        // Calculate totals
        const totalMeals = members.reduce((sum, member) => sum + member.meal, 0);
        const totalBazar = members.reduce((sum, member) => sum + member.bazar, 0);
        
        // Check for zero meals

         if (totalMeals === 0) {
         resultsDiv.textContent = 'Total meals cannot be zero. Please enter meal counts.';
          return;
    }

    const mealRate = (totalBazar / totalMeals).toFixed(2);

    let resultHTML = '<p>Total Bazar: ' + totalBazar.toFixed(2) + '</p>' +
                '<p>Total Meals: ' + totalMeals.toFixed(2) + '</p>' +
                '<p>Meal Rate: ' + mealRate + ' per meal</p>' + '</br>' +
                 '<hr>'+ '</br>';

    members.forEach(member => {
        const cost = (member.meal * mealRate).toFixed(2);
        const balance = (member.bazar - cost).toFixed(2);
        const status = balance > 0 
        ? `+${balance} Taka, Will receive` 
        : `-${Math.abs(balance)} Taka, Will pay`;
    
    resultHTML += `<p><strong>${member.name}</strong>: ${status}</p>`;
    });

    resultsDiv.innerHTML = resultHTML;
    });

    // Input validation function (called from oninput attribute)
    window.validateInput = function(input) {
        // Ensure numeric input has at most 2 decimal places
        if (input.value.includes('.')) {
            const parts = input.value.split('.');
            if (parts[1].length > 2) {
                input.value = parts[0] + '.' + parts[1].substring(0, 2);
            }
        }
    };
});



