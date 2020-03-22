import React from "react";
import styles from "./trade_inputs.module.scss";

function TradeInputs() {
  return (
    <div className={`${styles.container} ${styles.hidden}`}>
      <div className={styles.set}>
        <span className={styles.label}>Book</span>
        <input type="text" className={styles.text} />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Date</span>
        <input type="text" className={styles.text} />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Symbol</span>
        <input type="text" className={styles.text} />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Price</span>
        <input type="text" className={styles.text} />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Leverage</span>
        <input type="text" className={styles.text} />
      </div>

      <div className={styles.set}>
        <span className={styles.label}>Operation</span>
        <div className={styles.operationBtnsContainer}>
          <button className={styles.operationBtn}>long</button>
          <button className={styles.operationBtn}>short</button>
        </div>
      </div>

      <button className={styles.btn}>ok</button>
    </div>
  );
}

export default TradeInputs;
