'use strict'

const RESULT_ERROR = "ERROR";

var calcDisplay = document.getElementById("calc-disp-text");
var calcClear = document.getElementById("calc-clear");
var calcDecimalPoint = document.getElementById("calc-dec")
var calcNumbers = Array.from(document.getElementsByClassName("calc-num"));
var calcOperations = Array.from(document.getElementsByClassName("calc-op"));
var calcEquals = document.getElementById("calc-eq");

/**
 * Return whether stack is full or not. True if not full, otherwise false.
 * @returns boolean
 */
function calcEqNotFull () {
    return calcDisplay.innerHTML.length < 100;
}

// Clear calculator display.
calcClear.onclick = () => calcDisplay.innerHTML = ""

// Add decimal point to calculator display if all conditions met.
calcDecimalPoint.onclick = () => {
    var equation = calcDisplay.innerHTML;
    var char = "";
    var i = calcDisplay.innerHTML.length - 1;

    // Find the next symbol in the calculator display and store it
    // in char, otherwise char will be "".
    while (!isNaN(parseInt(char = calcDisplay.innerHTML[i])) && --i > 0){}
 
    // If the symbol is not a decimal point and the most recent
    // inputted value is not the symbol then add a decimal point.
    if (char !== "." && i !== calcDisplay.innerHTML.length - 1) {
        calcDisplay.innerHTML += calcDecimalPoint.innerHTML;
    }
}

// Add the respective number selected to the calculator display if display not full.
calcNumbers.forEach((calcNumber, calcNumberIndex) =>
    calcNumber.onclick = () => calcEqNotFull() ? calcDisplay.innerHTML += calcNumber.innerHTML : false
);

// Add the respective operation selected to the calculator display if display not full.
calcOperations.forEach((calcOperation, calcOperationIndex) =>
    calcOperation.onclick = () => {
        var equation = calcDisplay.innerHTML;

        // If the most recent inputted value is not a symbol then add the operation
        // to the calculator display.
        if (!isNaN(parseInt(equation[equation.length - 1])) && calcEqNotFull()) {
            calcDisplay.innerHTML += calcOperation.innerHTML;
        // Otherwise if calculator display is not full than replace the old operation
        // with the new one.
        } else if (calcEqNotFull()) {
            var calcDisp = calcDisplay.innerHTML;
            var equation = calcDisp.slice(0, calcDisp.length - 1);
            var operation = calcOperation.innerHTML;

            calcDisplay.innerHTML = equation + operation;
        }
    }
)

// This is the simple way to evaluate the equation by using JavaScript's built in eval function.
//calcEquals.onclick = () => calcDisplay.innerHTML = eval(calcDisplay.innerHTML);

// This is the stack way to evaluate the equation.

/**
 * Object representation of a linked-list node.
 * In the case that the value property refers to an object, the clone method
 * tries to clone the object referred to by the value property.
 * @param   item        This is the value of the node.
 * @param   neighbor    This is the neighbor of the node.
 * @returns this        LNode object representing the next node in a linked list.
 */
function LNode (item, neighbor) {
    this.value = item;
    this.next = neighbor;

    // Clones the current node
    this.clone = (deepclone) => {
        if (deepclone === undefined) {
            deepclone = false
        }
        
        if (this.value instanceof Object) {
            // Tries to clone the object referenced by value property
            try {
                // Assign null if (deepclone and next is null) or (not deepclone)
                // Otherwise clone the next property
                var next = (deepclone && this.next === null) || !deepclone ? null : this.next.clone();

                return new LNode(this.value.clone(), next);
            // Otherwise, writes error to console and does not create an LNode object
            } catch (e) {
                console.log(e);
                return null;
            }
        } else {
            // Assign null if (deepclone and next is null) or (not deepclone)
            // Otherwise clone the next property
            var next = (deepclone && this.next === null) || !deepclone ? null : this.next.clone();

            return new LNode(this.value, next);
        }
    }

    // Do not create LNode if neighbor is not an LNode object
    // or value is null
    if (!(this.next instanceof LNode) || this.value === null) {
        return null;
    }
}

/**
 * Object representation of a stack data structure.
 * @param   arr     This is the array to be put into stack format.
 * @returns this    Stack object that contains all elements of the arr param.
 */
function Stack(arr) {
    this.top = null;
    this.length = 0;

    // Clones the current stack
    this.clone = () => {
        var clonedStack = new Stack();
        
        if (this.top !== null) {
            var stackArr = [this.top];
            var nextEl = this.top;

            // Store elements from stack into temporary array
            while ((nextEl = nextEl.next) != null) {
                // Add stack element to temporary array using shallow cloning
                stackArr.push(nextEl.clone(false));
            }

            // Store elements from temporary array into new stack
            while (stackArr.length > 0 && (nextEl = stackArr.pop()) != null) {
                // Add stack element to temporary array using shallow cloning
                if (nextEl.value instanceof Object) {
                    // Tries to clone the object referenced by value property
                    try {
                        clonedStack.push(nextEl.value.clone());
                    // Otherwise, writes error to console and does not create an LNode object
                    } catch (e) {
                        console.log(e);
                        return null;
                    }
                } else {
                    clonedStack.push(nextEl.value);
                }
            }
        }

        return clonedStack;
    }

    // Returns the value of the top element in the stack. 
    this.peek = () => this.top === null ? null : this.top.value;

    // Removes and returns the top element in the stack.
    this.pop = () => {
        if (this.top !== null) {
            var item = this.top.value;
            this.top = this.top.next;
            this.length--;
            return item;
        }

        return null;
    }

    // Appends to the top of the stack a new element.
    this.push = (item) => {
        this.top = new LNode(item, this.top)
        this.length++;
    }

    // Check stack not being initialized as empty stack.
    if (arr === undefined) {var arr = []}

    // Add elements from array parameter into the stack with end
    // of array being top of stack.
    var element = null;
    while (arr.length > 0 && (element = arr.shift()) !== "") {
        this.push(element);
    }
}

/**
 * Store equation into stack and return it.
 * Relies on the linked list node object.
 * @param   equation        This is the equation to be put separated into its
 *                          operands and operations.
 * @returns equationStack   Stack that contains the equations operands and
 *                          operations.
 */
function storeEquationInStack(equation) {
    var equationStack = new Stack();
    var equationTemp = [];
    var char = "";
    var num = "";

    // Push operations/operands to temp array while equation is not empty.
    while (equation.length > 0 && (char = equation.shift()) != "") {
        // Check that char is a number or a decimal.
        if (!isNaN(parseInt(char)) || char === ".") {
            num += char;
        // By default, operations are handled and if a number
        // already exists then push that to the temp array before the
        // operation.
        } else {
            if (num !== "") {
                equationTemp.push(parseFloat(num));
                num = "";
            }

            equationTemp.push(char);
        }

        // If at the end of equation, push last num to stack.
        if (equation.length == 0 && num !== "") {
            equationTemp.push(parseFloat(num));
        }
    }

    // Store elements from temp array into stack.
    while (equationTemp.length > 0) {
        equationStack.push(equationTemp.pop());
    }

    return equationStack;
}

/**
 * Calculates the result of the equation following BEDMAS rules and relies on equation stack.
 * @param   equationStack   Stack that keeps track of the operations and operands.
 * @param   negative        Keeps track of sign of first operand.
 * @returns result
 */
function calculateResult(equationStack, negative) {
    var char = "";
    var operand = "";
    var operation = "";
    var result = "";

    // Loop while top of stack is not empty.
    while (equationStack.peek() !== null && result !== RESULT_ERROR) {
        char = equationStack.pop();
        
        // char is a number and result is empty.
        if (!isNaN(parseFloat(char)) && result === "") {
            // result is the first operand in the stack.
            result = negative ? -parseFloat(char) : parseFloat(char);
        // char is a number but result is not empty, thus result
        // is error.
        } else if (!isNaN(parseFloat(char))) {
            result = RESULT_ERROR;
        // By default, char is an operation
        } else {
            operand = parseFloat(equationStack.peek());

            // Check that the next element in stack is a number.
            if (!isNaN(operand)) {
                // Follow BEDMAS rules (excluding BE)
                switch (char) {
                    // Division operation
                    case "/":
                        // Check that operand is not 0
                        if (operand !== 0) {
                            result /= operand;
                            operand = "";
                            equationStack.pop();
                        } else {
                            result = RESULT_ERROR;
                        }
                        break;
                    // Multiplication operation
                    case "*":
                        result *= operand;
                        operand = "";
                        equationStack.pop();
                        break;
                    // Subtraction Operation
                    case "-":
                        result += calculateResult(equationStack, true);
                        break;
                    // Addition Operation
                    case "+":
                        result += calculateResult(equationStack, false);
                        break;
                    default:
                        result = RESULT_ERROR;
                        break;
                }
            } else {
                result = RESULT_ERROR;
            }
        }
    }

    return result;
}

// Evaluate the equation and display it on the calculator display.
calcEquals.onclick = () => {
    var equation = Array.from(calcDisplay.innerHTML);
    var equationStack = null;
    var result = "";

    equationStack = storeEquationInStack(equation);
    
    // Top of stack is not a number, thus result is error.
    if (!isNaN(parseFloat(equationStack.peek()))) {
        result = calculateResult(equationStack)
    } else {
        result = "ERROR";
    }

    // Truncate number of decimals shown to 4.
    result = Number(result).toString();
    result = result.substr(0, result.indexOf(".") + 5);

    // Display the result.
    calcDisplay.innerHTML = result;
}