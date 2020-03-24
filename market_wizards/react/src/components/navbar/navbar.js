import React, { useState, useContext } from "react";
import styles from "./navbar.module.scss";

import { GlobalContext } from "../../context/global_state";

function Navbar() {
  const { recordsRequest } = useContext(GlobalContext);

  const [state, setState] = useState({
    records: false
  });

  return (
    <div className={styles.container}>
      <button className={styles.button}>Practice</button>
      <span className={styles.text}>/</span>
      <button
        className={
          state.records
            ? `${styles.button} ${styles.buttonActive}`
            : styles.button
        }
        onClick={() => {
          recordsRequest(!state.records);
          setState({
            ...state,
            records: !state.records
          });
        }}
      >
        Records
      </button>
      <span className={styles.text}>/</span>
      <button className={styles.button}>Statistic</button>
    </div>
  );
}

export default Navbar;
