import React, { useState, useEffect, useContext } from "react";
import styles from "./chart_input.module.scss";
import { GlobalContext } from "../../context/global_state";

function ChartInput() {
  const {
    forward,
    backward,
    symbolRequest,
    freqRequest,
    inputsRequest
  } = useContext(GlobalContext);

  const [symbols, setSymbols] = useState([
    "ES",
    "VIX",
    "NQ",
    "VXN",
    "QR",
    "RVX",
    "VLE",
    "SML",
    "ZN",
    //"TYVIX",
    "FX",
    "VSTX",
    "NP",
    "JNIV",
    "GSY",
    "NEAR",
    "ICSH",
    "SHV",
    "HYG",
    "EMB",
    "LQD",
    "IEF",
    //"MB",
    //"RXES",
    //"VX",
    "CL",
    //"OVX",
    "GC",
    //"GVZ",
    "DX",
    "E6",
    "J6"
  ]);

  const [symbolID, setSymbolID] = useState(null);

  const [inputs, setInputs] = useState({
    date: null,
    frequency: null,
    book: null
  });

  const [newSymbol, setNewSymbol] = useState(null);

  const [error, setError] = useState({
    newSymbol: false,
    date: false,
    freq: false,
    book: false
  });

  function keyboardSelect(e) {
    if (e === null) return;
    if (symbolID === null) return;

    let id;
    if (e.which === 38) {
      id = symbolID - 1;
      if (id < 0) {
        id = symbols.length - 1;
      }
    } else if (e.which === 40) {
      id = symbolID + 1;
      if (id > symbols.length - 1) {
        id = 0;
      }
    }

    selectSymbolId(id);
  }

  function selectSymbolId(id) {
    setSymbolID(id);
    symbolRequest(symbols[id]);
  }

  function keyboardHandler(e) {
    if (e.which === 38 || e.which === 40) {
      keyboardSelect(e);
    } else {
      if (e.which === 37) {
        backward();
      }

      if (e.which === 39) {
        forward();
      }
    }
  }

  useEffect(() => {
    console.log("chart inputs");
    window.addEventListener("keydown", keyboardHandler);
    return () => window.removeEventListener("keydown", keyboardHandler);
  }, [symbols, symbolID]);

  return (
    <div className={styles.container}>
      <div className={styles.set}>
        <span className={styles.label}>Symbols</span>
        <table
          cellPadding="0"
          cellSpacing="0"
          className={`${styles.text} ${styles.table}`}
        >
          <tbody>
            {symbols.map((symbol, index) => (
              <tr
                key={index}
                className={index === symbolID ? styles.tableSelected : ""}
                onClick={() => selectSymbolId(index)}
              >
                <td>{symbol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.set}>
        <span className={styles.separator} />
        <input
          type="text"
          className={styles.text}
          onChange={e => {
            const regex = RegExp("^[a-zA-Z0-9]*$");
            if (!regex.test(e.target.value)) {
              setError({
                ...error,
                newSymbol: true
              });
            } else {
              setError({
                ...error,
                newSymbol: false
              });
              setNewSymbol(e.target.value);
            }
          }}
        />
      </div>

      <button
        className={
          error.newSymbol ? `${styles.button} ${styles.error}` : styles.button
        }
        onClick={() => {
          if (newSymbol === null) return;
          const symbol = newSymbol.toUpperCase();
          if (!symbols.includes(symbol)) setSymbols([...symbols, symbol]);
        }}
      >
        add
      </button>

      <button className={styles.button}>random date</button>

      <div className={styles.set}>
        <span className={styles.label}>Date</span>
        <input
          type="text"
          className={styles.text}
          onChange={e => {
            const regex = RegExp("^[0-9]*$");
            if (!regex.test(e.target.value)) {
              setError({
                ...error,
                date: true
              });
            } else {
              setError({
                ...error,
                date: false
              });
              setInputs({ ...inputs, date: e.target.value });
            }
          }}
        />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Frequency</span>
        <input
          type="text"
          className={styles.text}
          onChange={e => {
            const regex = RegExp("^[dw]{0,1}$");
            if (!regex.test(e.target.value)) {
              setError({
                ...error,
                freq: true
              });
            } else {
              setError({
                ...error,
                freq: false
              });
              setInputs({ ...inputs, frequency: e.target.value });
            }
          }}
        />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Book</span>
        <input
          type="text"
          className={styles.text}
          onChange={e => {
            const regex = RegExp("^[a-zA-Z0-9]*$");
            if (!regex.test(e.target.value)) {
              setError({
                ...error,
                book: true
              });
            } else {
              setError({
                ...error,
                book: false
              });
              setInputs({ ...inputs, book: e.target.value });
            }
          }}
        />
      </div>

      <button
        className={
          !error.date && !error.freq && !error.book
            ? styles.button
            : `${styles.button} ${styles.error}`
        }
      >
        ok
      </button>
    </div>
  );
}

export default ChartInput;
