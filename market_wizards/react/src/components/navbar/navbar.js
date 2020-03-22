import React, { useState } from "react";
import styles from "./navbar.module.scss";

function Navbar() {
  const [showRecords, setShowRecords] = useState(false);

  function clickRecords() {
    setShowRecords(!showRecords);
  }

  return (
    <div className={styles.container}>
      <button className={styles.button}>Practice</button>
      <span className={styles.text}>/</span>
      <button
        className={
          showRecords
            ? `${styles.button} ${styles.buttonActive}`
            : styles.button
        }
        onClick={clickRecords}
      >
        Records
      </button>
      <span className={styles.text}>/</span>
      <button className={styles.button}>Statistic</button>
    </div>
  );
}

export default Navbar;
