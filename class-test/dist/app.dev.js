"use strict";

// const name = `Destiny Ogorchukwu`;
// const age = 41;
// const hello = (x) => {
//     return `Hello, my name is ${x}!`;
// }
// const greet = hello(name);
// const person = (y) => {
//     // Check if age is an integer
//     if (!Number.isInteger(y)) {
//         throw new Error("Age must be a whole number (integer).");
//     }
//     if (y <= 20) {
//         return `${greet}, and I am a teenager.`;
//     } else if (y > 20 && y <= 40) {
//         return `${greet}, and I am a middle aged adult.`;
//     } else {
//         return `${greet}, and I am older than 4 decades.`;
//     }
// }
// // try {
// //     const profile = person(age);
// //     console.log(profile);
// // } catch (error) {
// //     console.error(error.message);
// // }
// function calculate(num1, num2, operator) {
//     let result;
//     switch (operator) {
//         case "+":
//             result = num1 + num2;
//             break;
//         case "-":
//             result = num1 - num2;
//             break;
//         case "*":
//             result = num1 * num2;
//             break;
//         case "/":
//             if (num2 === 0) {
//                 result = "Error: Division by zero";
//             } else {
//                 result = num1 / num2;
//             }
//             break;
//         case "%":
//             result = num1 % num2;
//             break;
//         default:
//             result = "Invalid operator";
//     }
//     return result;
// }
// Example usage:
// console.log(calculate(10, 5, "+")); // 15
// console.log(calculate(10, 5, "/")); // 2
// console.log(calculate(10, 0, "/")); // "Error: Division by zero"
// console.log(calculate(10, 5, "?")); // "Invalid operator"
// if (2 + 2 === 4) {
//     switch (true) {
//         case (2 + 2 === 4):
//             console.log("Math still works!");
//     }
// }
// jav.js (without switch)
var display = document.querySelector('.display input');
var buttons = Array.from(document.querySelectorAll('input[type="button"]'));

function setDisplay(value) {
  display.value = value === '' || value == null ? '' : String(value);
  display.placeholder = display.value === '' ? '0' : '';
}

function lastChar() {
  return display.value.slice(-1);
}

var isOperator = function isOperator(ch) {
  return ['+', '-', '*', '/', '.'].includes(ch);
};

function sanitizeExpression(expr) {
  return expr.replace(/×/g, '*').replace(/x/gi, '*').replace(/÷/g, '/');
}

function evaluateExpression(expr) {
  expr = sanitizeExpression(expr).replace(/\s+/g, '');

  if (!/^[0-9+\-*/().]+$/.test(expr)) {
    throw new Error('Invalid characters');
  }

  if (isOperator(expr.slice(-1))) {
    expr = expr.slice(0, -1);
  }

  return Function("\"use strict\"; return (".concat(expr, ");"))();
}

function appendOperator(op) {
  var cur = display.value;

  if (cur === '' && op === '-') {
    setDisplay('-');
    return;
  }

  if (cur === '' || isOperator(lastChar())) {
    setDisplay(cur.slice(0, -1) + op);
  } else {
    setDisplay(cur + op);
  }
}

function handleButton(value) {
  var cur = display.value;

  if (value === 'AC') {
    setDisplay('');
  } else if (value === 'DEL') {
    setDisplay(cur.slice(0, -1));
  } else if (value === '%') {
    if (cur.trim() !== '') {
      var m = cur.match(/(.*?)(\d+(\.\d+)?)$/);

      if (m) {
        var prefix = m[1] || '';
        var numberPart = m[2];
        var percentVal = String(Number(numberPart) / 100);
        setDisplay(prefix + percentVal);
      } else {
        var val = Number(cur);
        if (!Number.isNaN(val)) setDisplay(String(val / 100));
      }
    }
  } else if (value === '=') {
    try {
      if (cur.trim() !== '') {
        var expr = cur.replace(/x/gi, '*');
        var result = evaluateExpression(expr);
        var rounded = typeof result === 'number' && !Number.isInteger(result) ? parseFloat(result.toPrecision(12)).toString() : String(result);
        setDisplay(rounded);
      }
    } catch (_unused) {
      setDisplay('Error');
      setTimeout(function () {
        return setDisplay('');
      }, 900);
    }
  } else if (value === 'x') {
    appendOperator('*');
  } else if (value === '/' || value === '+' || value === '-') {
    appendOperator(value);
  } else if (value === '.') {
    var match = cur.match(/(\d*\.\d*|\d+)$/);
    if (match && match[0].includes('.')) return;

    if (cur === '' || isOperator(lastChar())) {
      setDisplay(cur + '0.');
    } else {
      setDisplay(cur + '.');
    }
  } else if (value === '00') {
    if (cur === '' || cur === '0' && !cur.includes('.')) {
      setDisplay('0');
    } else {
      setDisplay(cur + '00');
    }
  } else if (/^\d$/.test(value)) {
    if (cur === '0') {
      setDisplay(value);
    } else {
      setDisplay(cur + value);
    }
  } else {
    setDisplay(cur + value);
  }
}

buttons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    return handleButton(btn.value);
  });
});
document.addEventListener('keydown', function (e) {
  var key = e.key;

  if (key === 'Enter') {
    e.preventDefault();
    handleButton('=');
  } else if (key === 'Backspace') {
    e.preventDefault();
    handleButton('DEL');
  } else if (/^[0-9]$/.test(key)) {
    handleButton(key);
  } else if (['.', '+', '-', '/', '%'].includes(key)) {
    handleButton(key);
  } else if (key === '*') {
    handleButton('x');
  }
});
setDisplay('');
//# sourceMappingURL=app.dev.js.map
