// init global variables
const apiUrl = "https://noroff-komputer-store-api.herokuapp.com"
let balance = 0
let loan = 0
let pay = 0

// declare html elements
let computersListElement = {}
let computerFeatureElement = {}
let computerTitleElement = {}
let computerDescriptionElement = {}
let computerPriceElement = {}
let computerImageElement = {}
let balanceElement = {}
let loanElement = {}
let loanBoxElement = {}
let payElement = {}

// declare computer storage 
let computers = []

// load data and initialize variables
const init = () => {

    // init html element variables
    computersListElement = document.getElementById('computer-list')
    computerFeatureElement = document.getElementById('computer-features')
    computerTitleElement = document.getElementById('computer-title')
    computerDescriptionElement = document.getElementById('computer-description')
    computerPriceElement = document.getElementById('computer-price')
    computerImageElement = document.getElementById('computer-image')
    balanceElement = document.getElementById('balance-value')
    loanElement = document.getElementById('loan-value')
    loanButton = document.getElementById('button-loan')
    loanBoxElement = document.getElementById('loan-value-box')
    repayLoanButton = document.getElementById('button-repayLoan')
    payElement = document.getElementById('pay-value')
    bankButton = document.getElementById('button-bank')
    workButton = document.getElementById('button-work')
    buyButton = document.getElementById('button-buy')

    // add event listeners
    computersListElement.addEventListener("change", onChangeComputerList)
    repayLoanButton.addEventListener("click", repayLoan)
    loanButton.addEventListener("click", getLoan)
    bankButton.addEventListener("click", transferToBank)
    workButton.addEventListener("click", doWork)
    buyButton.onclick = buyComputer

    // init start parameters
    setBalance(500)
    setLoan(0)
    setPay(0)

    // get computers form API
    fetch(apiUrl + "/computers")
    .then(response => response.json())
    .then(data => computers = data)
    .then(c => addComputersToMenu(computers))
    .then(x => onChangeComputerList(null, computers[0].id))
    .catch(error => console.log('Error: ', error))
}

/* 
==================================================================================================================================
    Data functions
================================================================================================================================== 
*/

const addComputersToMenu = (computers) => {
    computerList = 1
    computers.forEach(x => addComputerToMenu(x))
}

const addComputerToMenu = (computer) => {
    const newOption = document.createElement("option")
    newOption.value = computer.id
    newOption.appendChild(document.createTextNode(computer.title))
    computersListElement.appendChild(newOption)
}

const getComputerById = (id) => {
    return computers.filter(item => item.id == id)[0]
}

/* 
==================================================================================================================================
    View state functions
================================================================================================================================== 
*/

// update balance amount
const setBalance = (amount) => {
    balance = amount
    balanceElement.innerText = amount + " EUR"
}

// update loan amount
const setLoan = (amount) => {
    loan = amount
    loanElement.innerText = amount + " EUR"

    let visibility = (loan == 0) ? "hidden" : "visible"

    loanBoxElement.style.visibility = visibility
    repayLoanButton.style.visibility = visibility
}

// update pay amount
const setPay = (amount) => {
    pay = amount
    payElement.innerText = amount + " EUR"
}

// selecting a computer have to change current computer details
// function could be invoked by event handler (with event) or manually with given "id"
const onChangeComputerList = (e, id) => {
    if (e != null)
        id = e.target.value

    let computer = getComputerById(id)

    computerFeatureElement.innerHTML = computer.specs.join("<br/>")
    computerTitleElement.innerText = computer.title
    computerDescriptionElement.innerText = computer.description
    computerPriceElement.innerText = computer.price+" EUR"
    computerImageElement.src = apiUrl + "/" + computer.image
}

/* 
==================================================================================================================================
    Business logic functions 
================================================================================================================================== 
*/

// buy button:  attempt to “Buy” a laptop and validate whether the bank balance is sufficient to purchase the selected laptop. 
//
// If you do not have enough money in the “Bank”, a message must be shown that you cannot afford the laptop. 
// If you have sufficient “Money” in the account, the amount must be deducted from the bank and you must 
// receive a message that you are now the owner of the new laptop
const buyComputer = () => {
    let computer = getComputerById(computersListElement.value)
    if (balance >= computer.price)
    {
        balance = balance - computer.price
        setBalance(balance)
        
        addBoughtComputerToList(computer.id, computer.title)

        alert("Congratulations! You just bought a "+computer.title)
    }
    else alert("Sorry, you don't have enough money to buy this computer!")
}

// adds bought computer to overview list 
const addBoughtComputerToList = (id, title) => {
    document.getElementById('bought-computers-info').style.display = 'none'
    var boughtComputersList = document.getElementById('bought-computers-list')
    let listItem = null

    // find existing list item for amount update
    for (let index = 0; index < boughtComputersList.children.length; index++) {
        if (boughtComputersList.children[index].value == id) {
            listItem = boughtComputersList.children[index]
            break
        }
    }
 
    // update or add new list item 
    if (listItem != null)
    {
        let amount = listItem.getAttribute("data-amount")
        amount++
        listItem.setAttribute("data-amount", amount)
        listItem.innerText = amount+'x '+title
    }
    else {
        listItem = document.createElement("li")
        listItem.setAttribute("data-amount", "1")
        listItem.value = id
        listItem.appendChild(document.createTextNode("1x "+title))
        boughtComputersList.appendChild(listItem) 
    }

}

// loan button: attempt to get a loan from the bank. 
//
// If the Get a loan button is clicked, it must show a “Prompt” popup box that allows you to enter an amount. 
// Constraints on Get a loan button: 
// 1. You cannot get a loan more than double of your bank balance (i.e., If you have 500 you cannot get a loan greater than 1000.)
// 2. You cannot get more than one bank loan before buying a computer 
// Once you have a loan, you must pay it back BEFORE getting another loan
const getLoan = () => {

    if (loan > 0)
    {
        alert("You can not get one another loan if you already have one!")
        return
    }
    
    let amount = prompt("How much money do you want to borrow?")
    if (amount === null)
    return;

    let loanValue = parseInt(amount);

    if (loanValue > 0)
    {
        if (loanValue <= balance*2) {
            if (confirm('Are you sure you want to get a loan for '+loanValue+' EUR?')) {
                setLoan(loanValue)
                setBalance(balance+loanValue)
            }
        }
        else {
            alert("You can't get a loan that's double your balance!")
        }
    }
    else {
        alert("Invalid amount, you have to enter a valid number greater zero!")
    }
}

// work button: increase balance by 100 on each click
const doWork = () => {
    setPay(pay+100)
}

// bank button: transfer the money from your Pay balance to your Bank balance
// Constraints on Bank button: 
// 1. If you have an outstanding loan, 10% of your salary MUST first be deducted and transferred to the outstanding Loan amount 
// 2. The balance after the 10% deduction may be transferred to your bank account
const transferToBank = () => {
    let charge = 0
    if (loan > 0) {
        charge = pay*0.1
        setLoan((loan > charge) ? loan - charge : 0)
        setPay(pay - charge)
    }

    setBalance(balance+pay)
    setPay(0)
}

// repay Loan button: the full value of your current Pay
// amount should go towards the outstanding loan and NOT your bank account.
const repayLoan = () => {
    let rest = loan - pay
    if (rest >= 0)
    {
        setPay(0)
        setLoan(rest)
    }
    else {
        setPay(rest*-1)
        setLoan(0)
    }
}
