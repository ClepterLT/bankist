"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2021-07-03T09:11:59.604Z",
    "2021-06-23T17:01:17.194Z",
    "2021-07-01T20:36:17.929Z",
    "2021-07-02T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2021-07-02T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");
const labelLoan = document.querySelector(".js--loan-label");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

////////////////////////////////////////////
// FUNCTIONS

const formatMovementDate = function (date, locale) {
  // Calculating days passed from now
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(date, new Date());

  // Date display logic
  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed > 1 && daysPassed <= 10) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurrencyDisplay = (count, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(count);

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movementsSort = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movementsSort.forEach(function (mov, i) {
    const movementType = mov > 0 ? "deposit" : "withdrawal";

    // Constructing movement date from object
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movementType}">${
      i + 1
    } ${movementType}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurrencyDisplay(
          mov,
          acc.locale,
          acc.currency
        )}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });

  document.querySelectorAll(".movements__row").forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = "";
    else row.style.backgroundColor = "#eeeeee";
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = formatCurrencyDisplay(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const deposits = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrencyDisplay(
    deposits,
    acc.locale,
    acc.currency
  );

  const withdrawals = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrencyDisplay(
    Math.abs(withdrawals),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit / 100) * acc.interestRate)
    .reduce((acc, int) => acc + int);
  labelSumInterest.textContent = formatCurrencyDisplay(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((nameWord) => nameWord[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Calculate and display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const setLogoutTimer = function (seconds) {
  // Avoiding timer start delay
  const tick = function () {
    // Setting argument to minutes and seconds
    let min = String(Math.trunc(seconds / 60)).padStart(2, 0);
    let sec = String(seconds % 60).padStart(2, 0);

    // Updating UI
    labelTimer.textContent = `${min}:${sec}`;

    // After 5 minutes logout
    if (seconds === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease timer
    seconds--;
  };

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////////////////////////
// EVENT HANDLERS

let currentAccount, timer;

// ****************************
// FAKED LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// **************************

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date
    const now = new Date();

    // Date with API
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Without API
    /*
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const day = `${now.getDate()}`.padStart(2, 0);
    const hour = `${now.getHours()}`.padStart(2, 0);
    const minute = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${year}-${month}-${day}, ${hour}:${minute}`;
    */

    // Clear the input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Logout timer
    if (timer) clearInterval(timer);
    timer = setLogoutTimer(300);

    // Updating UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.username !== currentAccount.username
  ) {
    // Add withdrawal to loged user
    currentAccount.movements.push(-amount);

    // Add deposit to the receiver
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Clear the input fields
    inputTransferTo.value = inputTransferAmount.value = "";

    // Update UI
    updateUI(currentAccount);

    // Reset logout timer
    clearInterval(timer);
    timer = setLogoutTimer(300);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      // Add the movement
      currentAccount.movements.push(amount);
      // Add the movement date
      currentAccount.movementsDates.push(new Date().toISOString());
      // Updating UI
      updateUI(currentAccount);
      // Show and later close confirmation message
      labelLoan.textContent = "Loan approved!";
      setTimeout(() => (labelLoan.textContent = "Request loan"), 2500);
    }, 2500);
  } else {
    console.log(
      "I am very sorry, but you do not meet conditions to get the loan 😓"
    );
  }
  // Empty the input field
  inputLoanAmount.value = "";

  // Reset logout timer
  clearInterval(timer);
  timer = setLogoutTimer(300);
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  const closureAccount = inputCloseUsername.value;
  const closurePIN = Number(inputClosePin.value);

  if (
    currentAccount.username === closureAccount &&
    currentAccount.pin === closurePIN
  ) {
    // Find account to delete in array
    const closureIndex = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    // Delete account
    accounts.splice(closureIndex, 1);

    // Hide UI
    currentAccount = "";
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = "";
  } else {
    console.log("Credentials doesn't match with your account credentials.");
  }
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;

  // Reset logout timer
  clearInterval(timer);
  timer = setLogoutTimer(300);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
