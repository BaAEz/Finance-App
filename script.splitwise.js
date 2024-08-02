// Initialize storage and set default currency
const friends = JSON.parse(localStorage.getItem('friends')) || [];
const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
const currencySymbol = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
let currentCurrency = 'INR'; // Default currency set to INR

// Update Friend List
function updateFriendList() {
    const friendList = document.getElementById('friend-list');
    friendList.innerHTML = '';
    friends.forEach((friend, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${friend} 
            <div class="buttons">
                <button onclick="deleteFriend(${index})">Delete</button>
            </div>`;
        friendList.appendChild(li);
    });
}

// Update Expense List
function updateExpenseList() {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${expense.description}: ${currencySymbol[currentCurrency]}${expense.amount} (Paid by ${expense.payer})
            <div class="buttons">
                <button onclick="deleteExpense(${index})">Delete</button>
            </div>`;
        expenseList.appendChild(li);
    });
}

// Update Balances
function updateBalances() {
    const balances = {};

    // Calculate net balances
    expenses.forEach(expense => {
        const amountPerPerson = expense.amount / friends.length;
        friends.forEach(friend => {
            if (!balances[friend]) balances[friend] = 0;
        });
        balances[expense.payer] += (amountPerPerson * (friends.length - 1));
        friends.forEach(friend => {
            if (friend !== expense.payer) {
                balances[friend] -= amountPerPerson;
            }
        });
    });

    // Generate a list of transactions to minimize transactions
    const transactions = [];
    const balanceEntries = Object.entries(balances).filter(([_, balance]) => balance !== 0);
    const positiveBalances = balanceEntries.filter(([_, balance]) => balance > 0);
    const negativeBalances = balanceEntries.filter(([_, balance]) => balance < 0);

    while (positiveBalances.length && negativeBalances.length) {
        const [creditor, creditAmount] = positiveBalances.pop();
        const [debtor, debitAmount] = negativeBalances.pop();
        
        const amount = Math.min(creditAmount, -debitAmount);
        transactions.push({ from: debtor, to: creditor, amount: amount });

        if (creditAmount > -debitAmount) {
            positiveBalances.push([creditor, creditAmount - amount]);
        } else if (creditAmount < -debitAmount) {
            negativeBalances.push([debtor, debitAmount + amount]);
        }
    }

    // Update UI
    const balanceList = document.getElementById('balance-list');
    balanceList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.from} owes ${transaction.to}: ${currencySymbol[currentCurrency]}${transaction.amount.toFixed(2)}`;
        li.className = 'transaction';
        balanceList.appendChild(li);
    });
}

// Update Payer Dropdown
function updatePayerDropdown() {
    const payerDropdown = document.getElementById('payer');
    payerDropdown.innerHTML = '<option value="" disabled selected>Select payer</option>';
    friends.forEach(friend => {
        const option = document.createElement('option');
        option.value = friend;
        option.textContent = friend;
        payerDropdown.appendChild(option);
    });
}

// Add Friend
function addFriend() {
    const friendName = document.getElementById('friend-name').value;
    if (friendName && !friends.includes(friendName)) {
        friends.push(friendName);
        localStorage.setItem('friends', JSON.stringify(friends));
        updateFriendList();
        updatePayerDropdown();
        updateBalances();
        document.getElementById('friend-name').value = ''; // Clear input
    }
}

// Delete Friend
function deleteFriend(index) {
    friends.splice(index, 1);
    localStorage.setItem('friends', JSON.stringify(friends));
    updateFriendList();
    updatePayerDropdown();
    updateBalances();
}

// Add Expense
function addExpense() {
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const payer = document.getElementById('payer').value;

    if (description && amount > 0 && payer && friends.includes(payer)) {
        expenses.push({ description, amount, payer });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateExpenseList();
        updateBalances();
        document.getElementById('expense-description').value = ''; // Clear input
        document.getElementById('expense-amount').value = ''; // Clear input
        document.getElementById('payer').value = ''; // Reset dropdown
    }
}

// Delete Expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseList();
    updateBalances();
}

// Update Currency
function updateCurrency() {
    currentCurrency = document.getElementById('currency-selector').value;
    updateExpenseList();
    updateBalances();
}

// Initialize UI
updateFriendList();
updateExpenseList();
updateBalances();
updatePayerDropdown();

// Set default currency
document.getElementById('currency-selector').value = 'INR'; // Set INR as default
document.getElementById('currency-selector').addEventListener('change', updateCurrency);



