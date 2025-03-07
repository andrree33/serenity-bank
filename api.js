class User {
    constructor(username, password, fullName, initialDeposit) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.accountNumber = generateAccountNumber();
        this.accountBalance = initialDeposit,
        this.transactions = generateTransactions(50);
    }
}

class Transaction {
    constructor(date, location, amount) {
        this.date = date;
        this.location = location;
        this.amount = amount;
    }
}

function createUser() {
    var username = document.getElementById("username-field");
    var password = document.getElementById("password-field");
    var confirmPassword = document.getElementById("confirm-password-field");
    var fullName = document.getElementById("full-name-field");
    var initialDeposit = document.getElementById("initial-deposit-field");
    if (!initialDeposit.value || initialDeposit.value == null) {
        alert("Initial deposit required.");
        return;
    }
    if (password.value != confirmPassword.value) {
        alert("Passwords do not match.");
        return;
    }
    var sanitizedInitialDepositValue = removeCurrencyCharacters(initialDeposit.value);
    var user = new User(username.value, password.value, fullName.value, parseFloat(sanitizedInitialDepositValue));
    addUser(user);
    alert("Your new account has been created!\nReturning to login screen.");
    window.location.href = "../index.html";
}

function loginUser() {
    var inputUsername = document.getElementById("username-field");
    var inputPassword = document.getElementById("password-field");
    console.info("Authenticating user: " + inputUsername.value);
    var user = getUser(inputUsername.value);
    if (!user) {
        alert("User does not exist.");
        return;
    }

    if (user.password != inputPassword.value) {
        alert("Invalid credentials.");
        return;
    }
    setActiveUser(user);
    window.location.href = "components/account-summary.html";
}

function logoutUser() {
    setActiveUser(null);
}

function addUser(user) {
    var users = getValue("users");
    if (!users) {
        users = [];
    }
    users.push(user);
    storeValue("users", users);
}

function getUser(username) {
    var users = getValue("users");
    if (!users) {
        users = [];
    }
    var user = users.find(u => u.username == username);
    return user;
}

function setActiveUser(user) {
    storeValue("activeUser", user);
}

function getValue(key) {
    var json =  localStorage.getItem(key);
    if (!json) {
        console.warn("Cache key " + key + "was null.")
        return;
    }
    return JSON.parse(json);
}

function storeValue(key, object) {
    var json = JSON.stringify(object);
    localStorage.setItem(key, json);
}

function generateAccountNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.random() * (max - min) + min;
    return parseFloat(randomNumber.toFixed(0));
}

function getRandomTransactionDate(from, to) {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    var date = new Date(fromTime + Math.random() * (toTime - fromTime));
    return date;
}

function getRandomTransactionLocation() {
    var locations = ["Home Depot", "Apple Store", "Best Buy", "Chick-fil-A", "Publix"];
    const index = Math.floor(Math.random() * locations.length);
    return locations[index];
}

function getRandomTransactionAmount() {
    const min = 1;
    const max = 1000;
    const randomNumber = Math.random() * (max - min) + min;
    return parseFloat(randomNumber.toFixed(2));
}

function generateTransactions(transactionCount) {
    var transactions = [];
    for (let i = 0; i < transactionCount; i++) {
        var today = new Date();
        var date = getRandomTransactionDate(today - 1000 * 60 * 60 * 24 * 30, today)
        var location = getRandomTransactionLocation();
        var amount = getRandomTransactionAmount();
        var transaction = new Transaction(date, location, amount)
        transactions.push(transaction);
    }
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return transactions;
}

function populateAccountSummary() {
    var user = getValue("activeUser");
    console.info("Populating account summary for user: " + user.username);
    document.getElementById("full-name-display").innerHTML = user.fullName;
    document.getElementById("account-number-display").innerHTML = user.accountNumber;
    document.getElementById("today-date-display").innerHTML = new Date().toLocaleDateString();
    document.getElementById("account-balance-display").innerHTML = formatAsCurrency(user.accountBalance);
    const table = document.getElementById("transaction-history");
    user.transactions.forEach(transaction => {
        const row = table.insertRow();
        for (const data in transaction) {
            const cell = row.insertCell();
            var content = null;
            switch (data) {
                case 'date':
                    content = new Date(transaction[data]).toLocaleDateString();
                    break;
                case 'amount':
                    content = formatAsCurrency(transaction[data]);
                    break;
                default:
                    content = transaction[data];
                    break;
            }
            cell.textContent = content;
        }
    });
}

function formatAsCurrency(number, currencyCode = 'USD', locale = 'en-US') {
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    });
    return formatter.format(number);
}

function removeCurrencyCharacters(string) {
    return string.replace(/[$|,]/g, '');
}
