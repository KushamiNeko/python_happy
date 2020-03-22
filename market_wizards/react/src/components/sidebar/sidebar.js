import React from "react";
import styles from "./sidebar.module.scss";
import ChartInput from "../chart_inputs/chart_input";

function Sidebar() {
  return (
    <div className={styles.container}>
      <ChartInput></ChartInput>
    </div>
  );
}

export default Sidebar;
