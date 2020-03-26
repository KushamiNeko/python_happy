import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./chart_input.module.scss";
import { ChartContext } from "../../context/chart";

function ChartInput() {
  const {
    symbolRequest,
    freqRequest,
    inputsRequest,
    forward,
    backward,
    addInputsCallback,
    addWorkingCallback
  } = useContext(ChartContext);

  const newSymbolRef = useRef(null);
  const dateRef = useRef(null);
  const freqRef = useRef(null);
  const bookRef = useRef(null);

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
    //newSymbol: null,
    //date: null,
    //frequency: null,
    //book: null,
    focused: {
      newSymbol: false,
      date: false,
      freq: false,
      book: false
    },
    key: "",
    working: false
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
    if (id < 0 || id >= state.symbols.length) {
      return;
    }

    if (params.current.working) {
      return;
    }

    setState({
      ...state,
      symbolID: id
    });
    symbolRequest(state.symbols[id]);
  }

  function keyboardHandler(e) {
    if (params.current.working) {
      return;
    }

    if (
      params.current.focused.newSymbol ||
      params.current.focused.date ||
      params.current.focused.freq ||
      params.current.focused.book
    ) {
      return;
    }

    if (e.which === 38 || e.which === 40) {
      keyboardSelect(e);
    } else {
      if (e.which === 37) {
        backward();
      } else if (e.which === 39) {
        forward();
      } else if (e.which >= 48 && e.which <= 57) {
        // number keys 48: 0, 49-57 : 1-9
        params.current.key += (e.which - 48).toString();
        setTimeout(() => {
          if (params.current.key !== "") {
            selectSymbolId(parseInt(params.current.key) - 1);
          }
          params.current.key = "";
        }, 200);
      } else {
        console.log(e.which);
        switch (e.which) {
          case 72:
            // h
            //freqRequest("h");
            break;
          case 68:
            // d
            freqRequest("d");
            break;
          case 87:
            // w
            freqRequest("w");
            break;
          case 77:
            // m
            //freqRequest("m");
            break;
          case 13:
            // enter
            //toggleFullScreen();
            break;
          case 32:
            // space
            //if (_modal.isOpen) {
            //_modal.close();
            //} else {
            //_modal.open();
            //}
            break;
          default:
            break;
        }
      }
    }
  }

  useEffect(() => {
    if (state.symbolID === null) {
      selectSymbolId(0);
    }

    addInputsCallback("CHART_INPUTS", (date, freq, book) => {
      console.log("input");
      dateRef.current.value = date;
      freqRef.current.value = freq;
      bookRef.current.value = book;
    });

    addWorkingCallback("CHART_INPUTS", working => {
      params.current.working = working;
    });

    window.addEventListener("keydown", keyboardHandler);
    return () => window.removeEventListener("keydown", keyboardHandler);
  });

  console.log("chart inputs");

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
          ref={newSymbolRef}
          type="text"
          className={styles.text}
          onFocus={() => (params.current.focused.newSymbol = true)}
          onBlur={() => (params.current.focused.newSymbol = false)}
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
          if (newSymbolRef.current.value === "") {
            return;
          }
          const symbol = newSymbolRef.current.value.toUpperCase();
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
          ref={dateRef}
          type="text"
          className={styles.text}
          onFocus={() => (params.current.focused.date = true)}
          onBlur={() => (params.current.focused.date = false)}
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
              if (state.error.date) {
                setState({
                  ...state,
                  error: {
                    ...state.error,
                    date: false
                  }
                });
              }
            }
          }}
        />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Frequency</span>
        <input
          ref={freqRef}
          type="text"
          className={styles.text}
          onFocus={() => (params.current.focused.freq = true)}
          onBlur={() => (params.current.focused.freq = false)}
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
              if (state.error.freq) {
                setState({
                  ...state,
                  error: {
                    ...state.error,
                    freq: false
                  }
                });
              }
            }
          }}
        />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Book</span>
        <input
          ref={bookRef}
          type="text"
          className={styles.text}
          onFocus={() => (params.current.focused.book = true)}
          onBlur={() => (params.current.focused.book = false)}
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
              if (state.error.book) {
                setState({
                  ...state,
                  error: {
                    ...state.error,
                    book: false
                  }
                });
              }
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
        onClick={() => {
          if (state.symbolID === null) {
            return;
          }

          if (state.error.date || state.error.freq || state.error.book) {
            return;
          }

          inputsRequest(
            dateRef.current.value,
            state.symbols[state.symbolID],
            freqRef.current.value,
            bookRef.current.value
          );
        }}
      >
        ok
      </button>
    </div>
  );
}

export default ChartInput;
