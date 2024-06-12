window.onerror = (msg, url, line, col, error) => {
    // Note that col & error are new to the HTML 5 spec and may not be 
    // supported in every browser.  It worked for me in Chrome.
    let extra = col ? `\ncolumn: ${col}` : '';
    extra += error ? `\nerror: ${error}` : '';

    // You can view the information in an alert to see things working like this:
    alert(`Uncaught error.\nPlease report this and consider reloading the page.\n\n${msg}\nurl: ${url}\nline: ${line}${extra}`);
};
