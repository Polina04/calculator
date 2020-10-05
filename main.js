class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement, history) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.readyToReset = false;
    this.history = history;
    this.calculation = [];
    this.clear();
  }

  clear() {
    this.currentOperand = "";
    this.previousOperand = "";
    this.operation = undefined;
    this.readyToReset = false;
  }
  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }
  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".")) return;
    this.calculation.push(number);
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }
  showError() {
    refs.error.style.display = "block";
    setTimeout(() => (refs.error.style.display = "none"), 2500);
  }
  chooseOperation(operation) {
    if (this.currentOperand !== "" && operation === "√") {
      if (this.currentOperand < 0) {
        this.showError();
        return;
      }
      this.currentOperand = Math.sqrt(this.currentOperand);
      return;
    }

    if (this.currentOperand === "") return;
    if (this.previousOperand !== "" && this.previousOperand !== "") {
      this.compute();
    }
    if (this.calculation.length === 0 && this.currentOperand) {
      this.calculation.push(this.currentOperand, operation);
    } else {
      this.calculation.push(operation);
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = "";
  }
  computeFractionHelper(prev, current) {
    const partsOfPrev = prev.toString().split(".");

    const partsOfCurrent = current.toString().split(".");

    if (partsOfPrev.length < 2 && partsOfCurrent.length < 2) {
      const fractionHelper = 1;
      return fractionHelper;
    } else if (partsOfPrev.length >= 2 && partsOfCurrent.length >= 2) {
      const fractionalValuePrev = Math.pow(10, partsOfPrev[1].length);
      const fractionalValueCurrent = Math.pow(10, partsOfCurrent[1].length);
      const fractionHelper = Math.max(
        fractionalValuePrev,
        fractionalValueCurrent
      );
      return fractionHelper;
    } else if (partsOfPrev.length >= 2 && partsOfCurrent.length < 2) {
      const fractionHelper = Math.pow(10, partsOfPrev[1].length);
      return fractionHelper;
    } else if (partsOfCurrent.length >= 2 && partsOfPrev.length < 2) {
      const fractionHelper = Math.pow(10, partsOfCurrent[1].length);
      return fractionHelper;
    }
  }
  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    if (isNaN(current) || isNaN(prev)) return;
    const fractionHelper = this.computeFractionHelper(prev, current);
    switch (this.operation) {
      case "+":
        computation =
          (prev * fractionHelper + current * fractionHelper) / fractionHelper;
        break;
      case "-":
        computation =
          (prev * fractionHelper - current * fractionHelper) / fractionHelper;
        break;
      case "*":
        computation = prev * current;
        break;
      case "÷":
        computation = prev / current;
        break;
      case "^":
        computation = Math.pow(prev, current);
        break;
      default:
        return;
    }
    // this.calculation.push( parseFloat(computation.toFixed(15)).toString());
    this.currentOperand = parseFloat(computation.toFixed(15)).toString();
    this.operation = undefined;
    this.previousOperand = "";
    this.readyToReset = true;
  }
  changeSign() {
    const signValue = Math.sign(this.currentOperand);
    switch (signValue) {
      case 1:
        this.currentOperand = 0 - this.currentOperand;
        break;
      case -1:
        this.currentOperand = -1 * this.currentOperand;
        break;
      default:
        break;
    }
  }

  addToHistory() {
    const historyElements = document.querySelectorAll(".operation");
    if (historyElements.length > 10) {
      historyElements[7].remove();
    }
    const itemMarkup = `<li class="operation">${this.calculation.join(" ")} = ${
      this.currentOperand
    }</li>`;
    this.history.insertAdjacentHTML("afterbegin", itemMarkup);
    this.calculation = [];
  }
  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0
      });
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }
  updateDisplay() {
    this.currentOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand
    );
    if (this.operation != null && this.operation === "√") {
      this.currentOperandTextElement.innerText = this.getDisplayNumber(
        this.currentOperand
      );
      return;
    } else if (this.operation != null) {
      this.previousOperandTextElement.innerText = `${this.getDisplayNumber(
        this.previousOperand
      )} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = "";
    }
  }
}

const refs = {
  numberButtons: document.querySelectorAll("[data-number]"),
  operationButtons: document.querySelectorAll("[data-operation]"),
  equalsButton: document.querySelector("[data-equals]"),
  deleteButton: document.querySelector("[data-delete]"),
  allClearButton: document.querySelector("[data-all-clear]"),
  previousOperandTextElement: document.querySelector("[data-previous-operand]"),
  currentOperandTextElement: document.querySelector("[data-current-operand]"),
  signChangeButton: document.querySelector("[data-sign-change]"),
  error: document.querySelector("[data-error]"),
  history: document.querySelector("[data-history]")
};
const calculator = new Calculator(
  refs.previousOperandTextElement,
  refs.currentOperandTextElement,
  refs.history
);

refs.numberButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (
      calculator.previousOperand === "" &&
      calculator.currentOperand !== "" &&
      calculator.readyToReset
    ) {
      calculator.currentOperand = "";
      calculator.readyToReset = false;
    }
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});
refs.operationButtons.forEach(button => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  });
});
refs.equalsButton.addEventListener("click", () => {
  calculator.compute();
  calculator.addToHistory();
  calculator.updateDisplay();
});
refs.allClearButton.addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});
refs.deleteButton.addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});
refs.signChangeButton.addEventListener("click", () => {
  calculator.changeSign();
  calculator.updateDisplay();
});
