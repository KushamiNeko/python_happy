import React from "react";
import styles from "./practice.module.scss";
import Sidebar from "../../components/sidebar/sidebar";
import Canvas from "../../components/canvas/canvas";

function PracticeView() {
  return (
    <div className={styles.content}>
      <Sidebar />
      <Canvas />
    </div>
  );
}

export default PracticeView;
