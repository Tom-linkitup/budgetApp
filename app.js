//budgetController
var budgetController = (function(){
    let Expense = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100)
        }else {
            this.percentage = -1
        } 
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

    let Income = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
    }
    let calculateTotal = function (type){
        let sum = 0
        data.allItems[type].forEach((item) => {
            sum += item.value
        })
        data.totals[type] = sum
    }
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return {
        addItem: function(type, des, val){
            var newItem, ID

            // create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            }else{
                ID = 0
            }
            // create new item
            if (type === "exp"){
                newItem = new Expense(ID, des, val)
            }else if(type === "inc"){
                newItem = new Income(ID, des, val)
            }
            // push it into the data structure
            data.allItems[type].push(newItem)
            //return new item
            return newItem
        },

        deleteItem: function(type, id){
            let ids = data.allItems[type].map(current => current.id)
            let index = ids.indexOf(id)

            if(index !== -1){
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function(){
            //calculate the total income and expense
            calculateTotal("exp")
            calculateTotal("inc")

            //calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp
            //calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            }else {
                data.percentage = -1
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.map((item) => {
                item.calcPercentage(data.totals.inc)
            })
        },  

        getPercentages: function(){
            let allPercentage = data.allItems.exp.map((item) => {
                return item.getPercentage()
            })
            return allPercentage
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        getData: function(){
            console.log(data.allItems)
        }
    }
})()

// UI Controller
var UIController = (function (){
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetValue: ".budget__value",
        totalInc: ".budget__income--value",
        totalExp: ".budget__expenses--value",
        percentage: ".budget__expenses--percentage",
        container: ".container",
        percentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

    var formatNumber =  function(num, type){
        num = Math.abs(num)
        num = num.toFixed(2)
        let numSplit = num.split(".")
        let int  = numSplit[0]
        if(int.length > 3){
            int = int.substr(0,int.length -3) + "," + int.substr(int.length - 3, int.length)
        }
        let decimal = numSplit[1]
        return (type === "exp" ? "-" : "+") + " " + int + "." + decimal
    }

    return {
        getInputData: function (){
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function(obj, type){
            // create HTML string with placeholder
            var html, element
            if(type === "inc"){
                element = DOMStrings.incomeContainer
                html = document.createElement("div")
                html.innerHTML = `<div class="item clearfix" id="inc-${obj.id}">
                                    <div class="item__description">${obj.description}</div>
                                    <div class="right clearfix">
                                    <div class="item__value">${formatNumber(obj.value, type)}</div>
                                        <div class="item__delete">
                                         <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                        </div>
                                    </div>
                                    </div>`
            }else if (type === "exp"){
                element = DOMStrings.expenseContainer
                html = document.createElement('div')
                html.innerHTML = `<div class="item clearfix" id="exp-${obj.id}">
                                <div class="item__description">${obj.description}</div>
                                <div class="right clearfix">
                                    <div class="item__value">${obj.value}</div>
                                    <div class="item__percentage">21%</div>
                                    <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                                </div>
                                </div>`
            }
            document.querySelector(element).appendChild(html)
        },

        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function(){
            let fields = document.querySelectorAll(`${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`)// nodeList: an array-like
            let fieldsArr = Array.prototype.slice.call(fields) // fields is called to be this array
            fieldsArr.map(input => input.value = "")
            fieldsArr[0].focus()
        },

        displayBudget: function(obj){
            var type
            if(obj.budget === 0){
                type = " "
            }else if (obj.budget > 0){
                type = "inc"
            }else {
                type = "exp"
            }

            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMStrings.totalInc).textContent = formatNumber(obj.totalInc, "inc")
            document.querySelector(DOMStrings.totalExp).textContent = formatNumber(obj.totalExp, "exp")
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentage).textContent = obj.percentage + "%"
            }else{
                document.querySelector(DOMStrings.percentage).textContent = "---"
            }
        },

        displayPercentages: function(percentages){
            let percentageFields =  document.querySelectorAll(DOMStrings.percentageLabel)
            let percentageFieldsArr = Array.prototype.slice.call(percentageFields)
            percentageFieldsArr.map((item, index) => {
                if(percentages[index] > 0){
                    item.textContent = percentages[index] + "%"
                }else{
                    item.textContent = "---"
                }
            })
        },

        displayMonth: function(){
            let now = new Date()
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            month = now.getMonth()
            year = now.getFullYear()
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year
        },

        changeType: function(){
            let fields = document.querySelectorAll(
                `${DOMStrings.inputType},
                ${DOMStrings.inputValue},
                ${DOMStrings.inputDescription}`
            
            )
            let fieldsArr = Array.prototype.slice.call(fields)
            fieldsArr.map(input => {
                input.classList.toggle("red-focus")
            })

            document.querySelector(DOMStrings.inputBtn).classList.toggle("red")
        },

        getDOMStrings: function(){
            return DOMStrings
        }
    }
})()

// control everything
var controller = (function (budgetCtrl, UICtrl){
    var setupEventListener = function (){
        var DOM = UICtrl.getDOMStrings()

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem)

        document.addEventListener("keypress", (e) => {
            if(e.keyCode === 13 || e.which === 13){
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType)
    }

    var updateBudget = function(){
       // calculate the budget
        budgetCtrl.calculateBudget()
       //return the budget
        let budget = budgetCtrl.getBudget()
       //display the budget UI
       UICtrl.displayBudget(budget)
    }

    var updatePercentage = function(){
        budgetCtrl.calculatePercentages()
        var percentages = budgetCtrl.getPercentages()
        UICtrl.displayPercentages(percentages)
    }

    var ctrlAddItem = function(){
        // 1. Get the input data
        let inputData = UICtrl.getInputData()

        if(inputData.description !== "" && !isNaN(inputData.value) && inputData.value > 0){
            // 2. Add the item to the budget controller
            let newItem = budgetCtrl.addItem(inputData.type, inputData.description, inputData.value)
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, inputData.type)
            UICtrl.clearFields()
            // 4. Calculate the budget
            updateBudget()
            // 5. update the percentage
            updatePercentage()
        }
    }

    var ctrlDeleteItem = function(e){
        let itemID = e.target.parentNode.parentNode.parentNode.parentNode.id

        if(itemID){
            splitID = itemID.split("-")
            type = splitID[0]
            ID = parseInt(splitID[1])
        }
        budgetCtrl.deleteItem(type, ID)
        UICtrl.deleteListItem(itemID)
        updateBudget()
        updatePercentage()
    }

    return {
        init: function(){
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListener()
        }
    }
})(budgetController, UIController)

controller.init()



