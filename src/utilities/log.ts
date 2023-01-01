const log = (function () {
  if (process.env.REACT_APP_LOGGING === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any[]) => {
      console.log(...args);
    };
  }
  return () => {
    undefined;
  };
})();

export { log };
