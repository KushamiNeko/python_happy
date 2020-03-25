import React, { createContext, useRef } from "react";

export const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
  const now = new Date();
  const params = useRef({
    working: false,
    symbol: "es",
    freq: "d",
    func: "refresh",
    date: `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now
      .getDate()
      .toString()
      .padStart(2, "0")}`,
    book: "",
    records: false,
    imageCallback: {},
    inputsCallback: {},
    quoteCallback: {}
  });

  function requestUrl() {
    const origin = "http://127.0.0.1:5000";
    let url = `${origin}/service/chart`;
    //const origin = "http://localhost:8080";
    //let url = `${origin}/service/plot/practice`;

    const now = new Date();

    url = `${url}?timestemp=${Math.round(now.getTime() / 1000)}`;
    url = `${url}&symbol=${params.current.symbol}&frequency=${params.current.freq}&function=${params.current.func}&date=${params.current.date}`;
    url = `${url}&book=${
      params.current.book
    }&records=${params.current.records.toString()}`;

    return url;
  }

  function imageSrc() {
    if (params.current.working) {
      return;
    }

    params.current.working = true;

    const url = requestUrl();
    params.current.src = url;

    console.log(url);

    fetch(url)
      .then(res => res.text())
      .then(data => {
        params.current.image = `data:image/png;base64,${data}`;

        const qurl = params.current.src.replace(
          /function=[^&]+/,
          "function=quote"
        );

        Object.values(params.current.imageCallback).map(cb =>
          cb(params.current.image)
        );

        fetch(qurl)
          .then(res => res.json())
          .then(data => {
            params.current.quote = data;
            params.current.date = data.date;

            Object.values(params.current.quoteCallback).map(cb => cb(data));

            Object.values(params.current.inputsCallback).map(cb =>
              cb(params.current.date, params.current.freq, params.current.book)
            );

            params.current.working = false;
          });
      });
  }

  function forward() {
    params.current.func = "forward";
    imageSrc();
  }

  function backward() {
    params.current.func = "backward";
    imageSrc();
  }

  function symbolRequest(symbol) {
    params.current.func = "refresh";
    params.current.symbol = symbol.toLowerCase();
    imageSrc();
  }

  function freqRequest(freq) {
    params.current.func = "simple";
    params.current.freq = freq;
    imageSrc();
  }

  function inputsRequest(symbol, date, freq, book = "") {
    params.current.func = "refresh";
    params.current.symbol = symbol.toLowerCase();
    params.current.freq = freq;
    params.current.date = date;
    params.current.book = book;
    imageSrc();
  }

  function recordsRequest(show) {
    params.current.records = show;
    imageSrc();
  }

  function randomDateRequest() {}

  function inspectRequest(callback, x, y, ax = null, ay = null) {
    let url = params.current.src;
    url = url.replace(/function=[^&]+/, "function=inspect");
    url = `${url}&x=${x}&y=${y}`;

    if (ax !== null && ax != null) {
      url = `${url}&ax=${ax}&ay=${ay}`;
    }

    if (!params.current.working) {
      fetch(url)
        .then(res => res.text())
        .then(data => {
          callback(data);
        });
    }
  }

  function addInputsCallback(key, callback) {
    if (!params.current.inputsCallback.hasOwnProperty(key)) {
      params.current.inputsCallback[key] = callback;
      console.log(params.current.inputsCallback);
    }
  }

  function addQuoteCallback(key, callback) {
    if (!params.current.quoteCallback.hasOwnProperty(key)) {
      params.current.quoteCallback[key] = callback;
      console.log(params.current.quoteCallback);
    }
  }

  function addImageCallback(key, callback) {
    if (!params.current.imageCallback.hasOwnProperty(key)) {
      params.current.imageCallback[key] = callback;
      console.log(params.current.imageCallback);
    }
  }

  console.log("provider");

  return (
    <ChartContext.Provider
      value={{
        symbolRequest,
        freqRequest,
        inputsRequest,
        recordsRequest,
        inspectRequest,
        forward,
        backward,
        addImageCallback,
        addInputsCallback,
        addQuoteCallback
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};
