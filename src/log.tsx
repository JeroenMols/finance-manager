const log = (function (environment) {
    if (process.env.REACT_APP_LOGGING === 'true') {
        return (...args: any[]) => {
            console.log(...args)
        }
    }
    return () => { }    
})()


export {
    log
}