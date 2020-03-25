import React, { useState, useContext } from "react";
import styles from "./navbar.module.scss";

//import { ChartContext } from "../../context/chart";

function Navbar() {
  //const { recordsRequest } = useContext(ChartContext);

  const [state, setState] = useState({
    records: false
  });

  return (
    <div className={styles.container}>
      <button className={styles.button}>Practice</button>
      <span className={styles.text}>/</span>
      <button className={styles.button}>Statistic</button>
    </div>
  );
}

      //<span className={styles.text}>/</span>
      //<button
        //className={
          //state.records
            //? `${styles.button} ${styles.buttonActive}`
            //: styles.button
        //}
        //onClick={() => {
          ////recordsRequest(!state.records);
          //setState({
            //...state,
            //records: !state.records
          //});
        //}}
      //>
        //Records
      //</button>

export default Navbar;
