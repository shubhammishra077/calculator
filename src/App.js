import React, { useState } from "react";

import Wrapper from "./components/Wrapper";
import Screen from "./components/Screen";
import ButtonBox from "./components/ButtonBox";
import Button from "./components/Button";

const btnValues = [
  ["C", "X", "%", "/"],
  [7, 8, 9, "*"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, ".", "="],
];

const toLocaleString = (num) =>
  String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1 ");

const removeSpaces = (num) => num.toString().replace(/\s/g, "");

const math = (a, b, sign) =>
  sign === "+"
    ? a + b
    : sign === "-"
    ? a - b
    : sign === "*"
    ? a * b
    : a / b;

const zeroDivisionError = "Can't divide with 0";

const App = () => {
  let [calc, setCalc] = useState({
    sign: "",
    num: 0,
    res: 0,
  });

  const [display, setDisplay] = useState("");
  const [lastEquals, setLastEquals] = useState(false);

  const numClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    if (lastEquals) {
      // start new after equals
      setCalc({ sign: "", num: value, res: 0 });
      setDisplay(value);
      setLastEquals(false);
      return;
    }

    if (removeSpaces(calc.num).length < 16) {
      const newNum =
        removeSpaces(calc.num) % 1 === 0 && !calc.num.toString().includes(".")
          ? toLocaleString(Number(removeSpaces(calc.num + value)))
          : toLocaleString(calc.num + value);

      setCalc({
        ...calc,
        num: newNum,
        res: !calc.sign ? 0 : calc.res,
      });

      setDisplay((prev) => prev + value);
    }
  };

  const comaClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    if (lastEquals) {
      setCalc({ sign: "", num: "0.", res: 0 });
      setDisplay("0.");
      setLastEquals(false);
      return;
    }

    if (!calc.num.toString().includes(".")) {
      setCalc({ ...calc, num: calc.num + value });
      setDisplay((prev) => prev + value);
    }
  };

  const signClickHandler = (e) => {
    const signValue = e.target.innerHTML;

    if (lastEquals) {
      setCalc({
        sign: signValue,
        num: 0,
        res: calc.res ? calc.res : calc.num,
      });
      setDisplay(`${calc.res ? calc.res : calc.num} ${signValue} `);
      setLastEquals(false);
      return;
    }

    setCalc({
      ...calc,
      sign: signValue,
      res: !calc.num
        ? calc.res
        : !calc.res
        ? calc.num
        : toLocaleString(
            math(
              Number(removeSpaces(calc.res)),
              Number(removeSpaces(calc.num)),
              calc.sign
            )
          ),
      num: 0,
    });

    setDisplay((prev) => prev + ` ${signValue} `);
  };

  const equalsClickHandler = () => {
    if (calc.sign && calc.num) {
      const computed =
        calc.num === "0" && calc.sign === "/"
          ? zeroDivisionError
          : toLocaleString(
              math(
                Number(removeSpaces(calc.res)),
                Number(removeSpaces(calc.num)),
                calc.sign
              )
            );

      setCalc({ ...calc, res: computed, sign: "", num: 0 });
      setDisplay(String(computed));
      setLastEquals(true);
    }
  };

  const percentClickHandler = () => {
    // Parse current num and res (remove formatting)
    const rawNum = calc.num ? parseFloat(removeSpaces(calc.num)) : 0;
    const rawRes = calc.res ? parseFloat(removeSpaces(calc.res)) : 0;

    if (calc.sign && rawRes) {
      // Treat current num as percentage of res: e.g. res + (res * num / 100)
      const percentOfRes = (rawRes * rawNum) / 100;
      const newNum = toLocaleString(percentOfRes);
      // set num to the percent value (so pressing '=' will use it)
      setCalc({ ...calc, num: newNum });
      setDisplay(String(newNum));
    } else {
      // No pending operation: convert current num to num/100
      const newNum = toLocaleString(rawNum / 100);
      setCalc({ ...calc, num: newNum });
      setDisplay(String(newNum));
    }

    setLastEquals(false);
  };

  // 🔙 Backspace handler for "X"
  const backspaceClickHandler = () => {
    setDisplay((prev) => prev.slice(0, -1));

    // also remove last digit from num (handle localized format)
    if (calc.num !== 0) {
      const updatedNum = removeSpaces(calc.num.toString()).slice(0, -1);
      setCalc({ ...calc, num: updatedNum ? toLocaleString(updatedNum) : 0 });
    }
  };

  const resetClickHandler = () => {
    setCalc({ sign: "", num: 0, res: 0 });
    setDisplay("");
    setLastEquals(false);
  };

  const buttonClickHandler = (e, btn) => {
    if (btn === "C" || calc.res === zeroDivisionError) return resetClickHandler();
    if (btn === "%") return percentClickHandler();
    if (btn === "=") return equalsClickHandler();
    if (btn === "/" || btn === "*" || btn === "-" || btn === "+")
      return signClickHandler(e);
    if (btn === ".") return comaClickHandler(e);
    if (btn === "X") return backspaceClickHandler(); // 🔙 delete one character
    return numClickHandler(e);
  };

  return (
    <Wrapper>
      <Screen value={display !== "" ? display : calc.num ? calc.num : calc.res} />
      <ButtonBox>
        {btnValues.flat().map((btn, i) => {
          // Inline style for C and X to force red background and white text
          const inlineStyle =
            btn === "C" || btn === "X"
              ? {
                  backgroundColor: "#ff0000",
                  color: "#ffffff",
                  borderColor: "#b30000",
                  boxShadow: "0px 5px 0px #8b0000",
                }
              : {};

          return (
            <Button
              key={i}
              className={
                btn === "="
                  ? "equals"
                  : btn === "X"
                  ? "delete"
                  : btn === "*"
                  ? "multiply"
                  : ""
              }
              value={btn}
              style={inlineStyle} // <-- inline styles applied here
              onClick={(e) => buttonClickHandler(e, btn)}
            />
          );
        })}
      </ButtonBox>
    </Wrapper>
  );
};

export default App;
