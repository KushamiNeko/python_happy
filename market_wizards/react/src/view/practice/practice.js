import React from "react";
import styles from "./practice.module.scss";
import Sidebar from "../../components/sidebar/sidebar";
import Canvas from "../../components/canvas/canvas";

import {ChartProvider} from "../../context/chart";

function PracticeView() {
  console.log("practice");

  return (
    <div className={styles.content}>
      <ChartProvider>
        <Sidebar />
        <Canvas />
      </ChartProvider>
    </div>
  );
}

export default PracticeView;
