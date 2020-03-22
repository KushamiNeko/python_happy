import React, { useEffect, useRef, useState } from "react";
import styles from "./canvas.module.scss";

function Canvas() {
  const coverColor = "rgba(0, 0, 0, 0.8)";
  const inspectColor = "rgba(255, 255, 255, 0.8)";
  const anchorColor = "rgba(255, 255, 255, 0.5)";

  const infoRef = useRef(null);
  const inspectRef = useRef(null);
  const coverRef = useRef(null);
  const imageRef = useRef(null);

  const [trigger, setTrigger] = useState({
    left: false,
    right: false,
    both: false,
    calc: false,
    moving: false
  });

  const [anchor, setAnchor] = useState({
    calcX: 0,
    calcY: 0
  });

  const [infoPos, setInfoPos] = useState({
    left: "",
    top: ""
  });

  function eventXOffset(e) {
    return e.clientX - imageRef.current.offsetLeft;
  }

  function eventYOffset(e) {
    return e.clientY - imageRef.current.offsetTop;
  }

  function initCanvasSize() {
    inspectRef.current.width = Math.floor(imageRef.current.clientWidth) - 1;
    inspectRef.current.height = Math.floor(imageRef.current.clientHeight) - 1;

    coverRef.current.width = Math.floor(imageRef.current.clientWidth) - 1;
    coverRef.current.height = Math.floor(imageRef.current.clientHeight) - 1;
  }

  function singleCoverR(e) {
    const cctx = coverRef.current.getContext("2d");

    cctx.clearRect(0, 0, coverRef.current.width, coverRef.current.height);
    cctx.fillStyle = coverColor;

    cctx.fillRect(
      eventXOffset(e),
      0,
      coverRef.current.width - eventXOffset(e),
      coverRef.current.height
    );
  }

  function singleCoverL(e) {
    const cctx = coverRef.current.getContext("2d");

    cctx.clearRect(0, 0, coverRef.current.width, coverRef.current.height);
    cctx.fillStyle = coverColor;

    cctx.fillRect(0, 0, eventXOffset(e), coverRef.current.height);
  }

  function doubleCover(e) {
    const cctx = coverRef.current.getContext("2d");

    cctx.clearRect(0, 0, coverRef.current.width, coverRef.current.height);
    cctx.fillStyle = coverColor;

    if (eventXOffset(e) >= anchor.calcX) {
      cctx.fillRect(0, 0, anchor.calcX, coverRef.current.height);

      cctx.fillRect(
        eventXOffset(e),
        0,
        coverRef.current.width - eventXOffset(e),
        coverRef.current.height
      );
    } else {
      cctx.fillRect(0, 0, eventXOffset(e), coverRef.current.height);

      cctx.fillRect(
        anchor.calcX,
        0,
        coverRef.current.width - anchor.calcX,
        coverRef.current.height
      );
    }
  }

  function inspectInfo(e) {
    const x = Math.max(
      Math.min(eventXOffset(e) / inspectRef.current.width, 1),
      0
    );
    const y = Math.max(
      Math.min(
        (inspectRef.current.height - eventYOffset(e)) /
          inspectRef.current.height,
        1
      ),
      0
    );

    if (trigger.calc) {
      const ax = Math.max(
        Math.min(anchor.calcX / inspectRef.current.width, 1),
        0
      );

      const ay = Math.max(
        Math.min(
          (inspectRef.current.height - anchor.calcY) /
            inspectRef.current.height,
          1
        ),
        0
      );

      //_server.inspectRequest(x, y, ax: ax, ay: ay);
    } else {
      //_server.inspectRequest(x, y);
    }

    const offset = 20;

    let l;
    if (eventXOffset(e) > inspectRef.current.width / 2) {
      l = `${e.clientX - infoRef.current.clientWidth - offset}px`;
    } else {
      l = `${e.clientX + offset}px`;
    }

    let t;
    if (eventYOffset(e) > inspectRef.current.height / 2) {
      t = `${e.clientY - infoRef.current.offsetHeight - offset}px`;
    } else {
      t = `${e.clientY + offset}px`;
    }

    setInfoPos({ left: l, top: t });
  }

  function inspect(e) {
    const ictx = inspectRef.current.getContext("2d");

    ictx.clearRect(0, 0, inspectRef.current.width, inspectRef.current.height);
    ictx.strokeStyle = inspectColor;

    ictx.beginPath();
    ictx.moveTo(eventXOffset(e), 0);

    ictx.lineTo(eventXOffset(e), inspectRef.current.height);

    ictx.stroke();
    ictx.closePath();

    ictx.beginPath();

    ictx.moveTo(0, eventYOffset(e));

    ictx.lineTo(inspectRef.current.width, eventYOffset(e));

    ictx.stroke();
    ictx.closePath();
  }

  function calcAnchor() {
    const ictx = inspectRef.current.getContext("2d");

    ictx.strokeStyle = anchorColor;

    ictx.beginPath();
    ictx.moveTo(anchor.calcX, 0);

    ictx.lineTo(anchor.calcX, inspectRef.current.height);

    ictx.stroke();
    ictx.closePath();

    ictx.beginPath();

    ictx.moveTo(0, anchor.calcY);

    ictx.lineTo(inspectRef.current.width, anchor.calcY);

    ictx.stroke();
    ictx.closePath();
  }

  function handlerUp() {
    setTrigger({
      ...trigger,
      left: false,
      right: false,
      both: false,
      calc: false
    });
  }

  function handlerMove(e) {
    if (!trigger.moving) {
      setTrigger({ ...trigger, moving: true });
    }

    inspectInfo(e);

    if (trigger.both) {
      doubleCover(e);
    } else if (trigger.left) {
      singleCoverL(e);
    } else if (trigger.right) {
      singleCoverR(e);
    }

    inspect(e);

    if (trigger.calc) {
      calcAnchor(e);
    }
  }

  function handlerDown(e) {
    const ictx = inspectRef.current.getContext("2d");
    const cctx = coverRef.current.getContext("2d");

    ictx.clearRect(0, 0, inspectRef.current.width, inspectRef.current.height);
    cctx.clearRect(0, 0, inspectRef.current.width, inspectRef.current.height);

    let l = false;
    let r = false;
    let d = false;
    if (e.ctrlKey) {
      l = true;
    } else if (e.shiftKey) {
      r = true;
    } else if (e.altKey) {
      d = true;
    }

    setTrigger({
      ...trigger,
      left: l,
      right: r,
      both: d,
      calc: true,
      moving: false
    });

    setAnchor({
      ...anchor,
      calcX: eventXOffset(e),
      calcY: eventYOffset(e)
    });
  }

  useEffect(() => {
    const imgLoaded = () => {
      initCanvasSize();
    };

    imageRef.current.addEventListener("load", imgLoaded);

    window.addEventListener("mouseup", handlerUp);
    window.addEventListener("mousemove", handlerMove);
    window.addEventListener("mousedown", handlerDown);

    return () => {
      imageRef.current.addEventListener("load", imgLoaded);
      window.removeEventListener("mouseup", handlerUp);
      window.removeEventListener("mousemove", handlerMove);
      window.removeEventListener("mousedown", handlerDown);
    };
  });

  return (
    <>
      <div
        ref={infoRef}
        style={{ ...infoPos }}
        className={
          trigger.moving
            ? styles.chartInfo
            : `${styles.chartInfo} ${styles.chartInfoHidden}`
        }
      >
        Info
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.chartContainer}>
          <canvas ref={inspectRef} className={styles.chartCover}></canvas>
          <canvas ref={coverRef} className={styles.chartCover}></canvas>

          <img
            ref={imageRef}
            className={styles.chartImage}
            alt=""
            src="test.png"
          />
        </div>
      </div>
    </>
  );
}

export default Canvas;
