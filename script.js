const startTestBtn = document.getElementById("start-test");
const pingSpan = document.getElementById("ping");
const downloadSpan = document.getElementById("download");
const uploadSpan = document.getElementById("upload");
const pingGaugeFill = document.querySelector("#ping-gauge .gauge__fill");
const downloadGaugeFill = document.querySelector("#download-gauge .gauge__fill");
const uploadGaugeFill = document.querySelector("#upload-gauge .gauge__fill");

function setGaugeValue(gaugeFill, value, max) {
    // Clamp the value between 0 and max.
    const clampedValue = Math.min(Math.max(value, 0), max);
    // Calculate the rotation from 0 to 0.5 turns (180 degrees).
    const rotation = (clampedValue / max) * 0.5;
    gaugeFill.style.transform = `rotate(${rotation}turn)`;
}

startTestBtn.addEventListener("click", () => {
    startTestBtn.disabled = true;
    startTestBtn.textContent = "Testing...";

    // Reset UI
    pingSpan.textContent = "...";
    downloadSpan.textContent = "...";
    uploadSpan.textContent = "...";
    setGaugeValue(pingGaugeFill, 0, 200);
    setGaugeValue(downloadGaugeFill, 0, 100);
    setGaugeValue(uploadGaugeFill, 0, 100);

    const pingTest = measurePing();
    const downloadTest = measureDownloadSpeed();
    const uploadTest = measureUploadSpeed();

    Promise.allSettled([pingTest, downloadTest, uploadTest]).then(() => {
        startTestBtn.disabled = false;
        startTestBtn.textContent = "Start Test";
    });
});

function measurePing() {
    return new Promise((resolve) => {
        const startTime = new Date().getTime();
        fetch("https://raw.githubusercontent.com/sonoflilith/speedtest-net-monitor/master/speedtest_files/10MB.dat?n=" + self.crypto.randomUUID(), { method: "HEAD", mode: 'cors' })
            .then(() => {
                const endTime = new Date().getTime();
                const ping = endTime - startTime;
                pingSpan.textContent = ping;
                setGaugeValue(pingGaugeFill, ping, 200);
                resolve();
            })
            .catch(error => {
                pingSpan.textContent = "Fail";
                console.error("Ping test failed:", error);
                resolve();
            });
    });
}

function measureDownloadSpeed() {
    return new Promise((resolve) => {
        const startTime = new Date().getTime();
        fetch("https://raw.githubusercontent.com/sonoflilith/speedtest-net-monitor/master/speedtest_files/10MB.dat?n=" + self.crypto.randomUUID())
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.blob();
            })
            .then(blob => {
                const endTime = new Date().getTime();
                const duration = (endTime - startTime) / 1000;
                if (duration < 0.5) {
                    downloadSpan.textContent = "Fast!";
                    setGaugeValue(downloadGaugeFill, 100, 100);
                    resolve();
                    return;
                }
                const bitsLoaded = blob.size * 8;
                const speedBps = bitsLoaded / duration;
                const speedKbps = speedBps / 1024;
                const speedMbps = speedKbps / 1024;
                downloadSpan.textContent = speedMbps.toFixed(2);
                setGaugeValue(downloadGaugeFill, speedMbps, 100);
                resolve();
            })
            .catch(error => {
                downloadSpan.textContent = "Fail";
                console.error("Download test failed:", error);
                resolve();
            });
    });
}

function measureUploadSpeed() {
    return new Promise((resolve) => {
        const dataSize = 8 * 1024 * 1024; // 8MB
        let data;
        try {
            // Generate a blob of random data.
            const buffer = new Uint8Array(dataSize);
            for (let i = 0; i < dataSize; i++) {
                buffer[i] = Math.floor(Math.random() * 256);
            }
            data = new Blob([buffer], { type: 'application/octet-stream' });
        } catch (e) {
            uploadSpan.textContent = "Fail";
            console.error("Could not generate upload data:", e);
            resolve();
            return;
        }

        const startTime = new Date().getTime();
        // Using a public endpoint. Speed may be limited by the server.
        fetch('https://httpbin.org/post', { method: 'POST', body: data })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const endTime = new Date().getTime();
                const duration = (endTime - startTime) / 1000;
                if (duration < 0.5) {
                    uploadSpan.textContent = "Fast!";
                    setGaugeValue(uploadGaugeFill, 100, 100);
                    resolve();
                    return;
                }
                const bitsLoaded = data.size * 8;
                const speedBps = bitsLoaded / duration;
                const speedKbps = speedBps / 1024;
                const speedMbps = speedKbps / 1024;
                uploadSpan.textContent = speedMbps.toFixed(2);
                setGaugeValue(uploadGaugeFill, speedMbps, 100);
                resolve();
            })
            .catch(error => {
                uploadSpan.textContent = "Fail";
                console.error("Upload test failed:", error);
                resolve();
            });
    });
}
