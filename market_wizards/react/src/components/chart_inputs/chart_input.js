import React, { useState, useEffect } from "react";
import styles from "./chart_input.module.scss";

function ChartInput() {
  const [symbols, setSymbols] = useState([
    "ES",
    "VIX",
    "NQ",
    "VXN",
    "QR",
    "RVX",
    "VLE",
    "ZN",
    //"TYVIX",
    "FX",
    "VSTX",
    "NP",
    //"JNIV",
    "NEAR",
    "ICSH",
    "GSY",
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
    "SML",
    "DX",
    "E6",
    "J6"
  ]);

  const [selectedSymbolId, setSelectSymbolId] = useState(null);

  const [inputs, setInputs] = useState({
    date: null,
    frequency: null,
    book: null
  });

  const [newSymbol, setNewSymbol] = useState(null);

  function keyboardSelect(e) {
    if (selectedSymbolId === null) return;

    let id;
    if (e.which === 38) {
      id = selectedSymbolId - 1;
      if (id < 0) id = symbols.length - 1;

      setSelectSymbolId(id);
    } else if (e.which === 40) {
      id = selectedSymbolId + 1;
      if (id > symbols.length - 1) id = 0;
    }

    setSelectSymbolId(id);
  }

  useEffect(() => {
    window.addEventListener("keydown", keyboardSelect);
    return () => window.removeEventListener("keydown", keyboardSelect);
  });

  return (
    <div className={styles.container}>
      <div className={styles.set}>
        <span className={styles.label}>Symbols</span>
        <table
          //cellPadding="0"
          cellSpacing="0"
          className={`${styles.text} ${styles.table}`}
        >
          <tbody>
            {symbols.map((symbol, index) => (
              <tr
                key={index}
                className={
                  index === selectedSymbolId ? styles.tableSelected : ""
                }
                onClick={() => setSelectSymbolId(index)}
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
          onChange={e => setNewSymbol(e.target.value)}
        />
      </div>

      <button
        className={styles.button}
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
          onChange={e => setInputs({ ...inputs, date: e.target.value })}
        />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Frequency</span>
        <input
          type="text"
          className={styles.text}
          onChange={e => setInputs({ ...inputs, frequency: e.target.value })}
        />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Book</span>
        <input
          type="text"
          className={styles.text}
          onChange={e => setInputs({ ...inputs, book: e.target.value })}
        />
      </div>

      <button className={styles.button}>ok</button>
    </div>
  );
}

export default ChartInput;
