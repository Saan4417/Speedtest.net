const startTestBtn = document.getElementById("start-test");
const pingSpan = document.getElementById("ping");
const downloadSpan = document.getElementById("download");
const uploadSpan = document.getElementById("upload");

startTestBtn.addEventListener("click", () => {
    // Reset results
    pingSpan.textContent = "0";
    downloadSpan.textContent = "0";
    uploadSpan.textContent = "0";

    // Start tests
    measurePing();
    measureDownloadSpeed();
    measureUploadSpeed();
});

function measurePing() {
    const startTime = new Date().getTime();
    // We use a cache-busting query parameter to prevent the browser from caching the file.
    fetch("https://raw.githubusercontent.com/sonoflilith/speedtest-net-monitor/master/speedtest_files/10MB.dat?n=" + Math.random(), { method: "HEAD" })
        .then(() => {
            const endTime = new Date().getTime();
            const ping = endTime - startTime;
            pingSpan.textContent = ping;
        });
}

function measureDownloadSpeed() {
    const startTime = new Date().getTime();
    // We use a cache-busting query parameter to prevent the browser from caching the file.
    fetch("https://raw.githubusercontent.com/sonoflilith/speedtest-net-monitor/master/speedtest_files/10MB.dat?n=" + Math.random())
        .then(response => {
            return response.blob();
        })
        .then(blob => {
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000; // in seconds
            const bitsLoaded = blob.size * 8;
            const speedBps = bitsLoaded / duration;
            const speedKbps = speedBps / 1024;
            const speedMbps = speedKbps / 1024;
            downloadSpan.textContent = speedMbps.toFixed(2);
        });
}

function measureUploadSpeed() {
    // A true upload speed test requires a server-side component to receive the data.
    // As this is a client-only implementation, we will not measure the upload speed.
    uploadSpan.textContent = "N/A";
}
