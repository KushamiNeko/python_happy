import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./chart_input.module.scss";
import { GlobalContext } from "../../context/global_state";

function ChartInput() {
  const {
    forward,
    backward,
    symbolRequest
    //freqRequest,
    //inputsRequest
  } = useContext(GlobalContext);

  const [state, setState] = useState({
    symbols: [
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
    ],
    symbolID: null,
    error: {
      symbol: false,
      date: false,
      freq: false,
      book: false
    }
  });

  const params = useRef({
    symbol: null,
    date: null,
    frequency: null,
    book: null
  });

  function keyboardSelect(e) {
    if (e === null) return;
    if (state.symbolID === null) return;

    let id;
    if (e.which === 38) {
      id = state.symbolID - 1;
      if (id < 0) {
        id = state.symbols.length - 1;
      }
    } else if (e.which === 40) {
      id = state.symbolID + 1;
      if (id > state.symbols.length - 1) {
        id = 0;
      }
    }

    selectSymbolId(id);
  }

  function selectSymbolId(id) {
    setState({
      ...state,
      symbolID: id
    });
    symbolRequest(state.symbols[id]);
  }

  function keyboardHandler(e) {
    if (e.which === 38 || e.which === 40) {
      keyboardSelect(e);
    } else {
      if (e.which === 37) {
        backward();
      } else if (e.which === 39) {
        forward();
      }
    }
  }

  useEffect(() => {
    console.log("chart inputs");
    window.addEventListener("keydown", keyboardHandler);
    return () => window.removeEventListener("keydown", keyboardHandler);
  }, [state.symbols, state.symbolID]);

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
            {state.symbols.map((symbol, index) => (
              <tr
                key={index}
                className={index === state.symbolID ? styles.tableSelected : ""}
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
              setState({
                ...state,
                error: {
                  ...state.error,
                  symbol: true
                }
              });
            } else {
              if (state.symbols.includes(e.target.value.toUpperCase())) {
                setState({
                  ...state,
                  error: {
                    ...state.error,
                    symbol: true
                  }
                });
                return;
              }

              setState({
                ...state,
                error: {
                  ...state.error,
                  symbol: false
                }
              });
              params.current.symbol = e.target.value;
            }
          }}
        />
      </div>

      <button
        className={
          state.error.symbol
            ? `${styles.button} ${styles.error}`
            : styles.button
        }
        onClick={() => {
          if (params.current.symbol === null) {
            return;
          }
          const symbol = params.current.symbol.toUpperCase();
          if (!state.symbols.includes(symbol)) {
            setState({
              ...state,
              symbols: [...state.symbols, symbol],
              error: {
                ...state.error,
                symbol: false
              }
            });
          }
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
              setState({
                ...state,
                error: {
                  ...state.error,
                  date: true
                }
              });
            } else {
              setState({
                ...state,
                error: {
                  ...state.error,
                  date: false
                }
              });
              params.current.date = e.target.value;
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
              setState({
                ...state,
                error: {
                  ...state.error,
                  freq: true
                }
              });
            } else {
              setState({
                ...state,
                error: {
                  ...state.error,
                  freq: false
                }
              });
              params.current.frequency = e.target.value;
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
              setState({
                ...state,
                error: {
                  ...state.error,
                  book: true
                }
              });
            } else {
              setState({
                ...state,
                error: {
                  ...state.error,
                  book: false
                }
              });
              params.current.book = e.target.value;
            }
          }}
        />
      </div>

      <button
        className={
          !state.error.date && !state.error.freq && !state.error.book
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
