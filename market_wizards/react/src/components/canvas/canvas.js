import React, { useEffect, useRef, useState, useContext } from "react";
import styles from "./canvas.module.scss";
import { ChartContext } from "../../context/chart";

function Canvas() {
  const { addImageCallback, inspectRequest } = useContext(ChartContext);

  const coverColor = "rgba(0, 0, 0, 0.8)";
  const inspectColor = "rgba(255, 255, 255, 0.8)";
  const anchorColor = "rgba(255, 255, 255, 0.5)";

  const infoRef = useRef(null);
  const inspectRef = useRef(null);
  const coverRef = useRef(null);
  const imageRef = useRef(null);

  const params = useRef({
    left: false,
    right: false,
    both: false,
    calc: false,
    calcX: 0,
    calcY: 0
  });

  const [state, setState] = useState({
    moving: false
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

    if (eventXOffset(e) >= params.current.calcX) {
      cctx.fillRect(0, 0, params.current.calcX, coverRef.current.height);

      cctx.fillRect(
        eventXOffset(e),
        0,
        coverRef.current.width - eventXOffset(e),
        coverRef.current.height
      );
    } else {
      cctx.fillRect(0, 0, eventXOffset(e), coverRef.current.height);

      cctx.fillRect(
        params.current.calcX,
        0,
        coverRef.current.width - params.current.calcX,
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

    if (params.current.calc) {
      const ax = Math.max(
        Math.min(params.current.calcX / inspectRef.current.width, 1),
        0
      );

      const ay = Math.max(
        Math.min(
          (inspectRef.current.height - params.current.calcY) /
            inspectRef.current.height,
          1
        ),
        0
      );

      inspectRequest(
        data => {
          infoRef.current.innerHTML = data;
        },
        x,
        y,
        ax,
        ay
      );
    } else {
      inspectRequest(
        data => {
          infoRef.current.innerHTML = data;
        },
        x,
        y
      );
    }

    const offset = 20;

    let l;
    if (eventXOffset(e) > inspectRef.current.width / 2) {
      l = `${e.clientX - infoRef.current.clientWidth - offset}px`;
    } else {
      l = `${e.clientX + offset}px`;
    }

    infoRef.current.style.left = l;

    let t;
    if (eventYOffset(e) > inspectRef.current.height / 2) {
      t = `${e.clientY - infoRef.current.offsetHeight - offset}px`;
    } else {
      t = `${e.clientY + offset}px`;
    }

    infoRef.current.style.top = t;
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
    ictx.moveTo(params.current.calcX, 0);

    ictx.lineTo(params.current.calcX, inspectRef.current.height);

    ictx.stroke();
    ictx.closePath();

    ictx.beginPath();

    ictx.moveTo(0, params.current.calcY);

    ictx.lineTo(inspectRef.current.width, params.current.calcY);

    ictx.stroke();
    ictx.closePath();
  }

  function handlerUp() {
    params.current.left = false;
    params.current.right = false;
    params.current.both = false;
    params.current.calc = false;
  }

  function handlerMove(e) {
    if (!state.moving) {
      setState({ ...state, moving: true });
    }

    inspectInfo(e);

    if (params.current.both) {
      doubleCover(e);
    } else if (params.current.left) {
      singleCoverL(e);
    } else if (params.current.right) {
      singleCoverR(e);
    }

    inspect(e);

    if (params.current.calc) {
      calcAnchor(e);
    }
  }

  function handlerDown(e) {
    const ictx = inspectRef.current.getContext("2d");
    const cctx = coverRef.current.getContext("2d");

    ictx.clearRect(0, 0, inspectRef.current.width, inspectRef.current.height);
    cctx.clearRect(0, 0, inspectRef.current.width, inspectRef.current.height);

    params.current.left = false;
    params.current.right = false;
    params.current.both = false;

    if (e.ctrlKey) {
      params.current.left = true;
    } else if (e.shiftKey) {
      params.current.right = true;
    } else if (e.altKey) {
      params.current.both = true;
    }

    params.current.calc = true;
    params.current.calcX = eventXOffset(e);
    params.current.calcY = eventYOffset(e);

    setState({
      ...state,
      moving: false
    });
  }

  useEffect(() => {

    addImageCallback("CANVAS", img => {
      imageRef.current.src = img
    })

    const imgLoaded = () => {
      initCanvasSize();
    };

    const irf = imageRef.current;

    irf.addEventListener("load", imgLoaded);

    window.addEventListener("resize", () => {
      initCanvasSize();
    });

    window.addEventListener("mouseup", handlerUp);
    window.addEventListener("mousemove", handlerMove);
    window.addEventListener("mousedown", handlerDown);

    return () => {
      irf.addEventListener("load", imgLoaded);
      window.removeEventListener("mouseup", handlerUp);
      window.removeEventListener("mousemove", handlerMove);
      window.removeEventListener("mousedown", handlerDown);
    };
  });

  console.log("canvas");

  return (
    <>
      <div
        ref={infoRef}
        className={
          state.moving
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

          <img ref={imageRef} className={styles.chartImage} src="" />
        </div>
      </div>
    </>
  );
}

function shouldUpdate(prev, next) {
  return prev.src !== next.src;
}

export default Canvas;
