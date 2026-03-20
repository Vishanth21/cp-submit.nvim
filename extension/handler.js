window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const rawData = urlParams.get("data")
    if (rawData) {
        const port = rawData.match(/\d+/)[0];
        try {
            const response = await fetch(`http://127.0.0.1:${port}`);
            const payload = await response.json();
            await chrome.storage.local.set({
                pendingCode: payload.code,
                pendingUrl: payload.url,
                pendingExt: payload.extension
            })

            let match = payload.url.match(/https?:\/\/([^/]+)/)
            const baseUrl = match ? match[1] : null;

            if (baseUrl === "codeforces.com") {
                // matches contest/2102/problem/A or problemset/problem/2102/A
                match = payload.url.match(/(?:contest|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Z0-9]+)/i);
                const [contestId, problemId] = match ? [match[1], match[2]] : [null, null];
                
                if (contestId && problemId) {
                    let submitUrl = `https://${baseUrl}/contest/${contestId}/submit?problemIndex=${problemId}`;
                    window.location.href = submitUrl;
                } else {
                    document.getElementById("status").textContent = `Failed to parse problem URL. Payload: ${JSON.stringify(payload)}`;
                }
            } else if (baseUrl) {
                document.getElementById("status").innerHTML =
                `Site "${baseUrl}" is not supported yet. 
 <a href="${chrome.runtime.getManifest().homepage_url}" target="_blank">Contribute here</a>`;
            } else {
                document.getElementById("status").textContent = `Failed to parse URL. Payload: ${JSON.stringify(payload)}`;
            }

        }
        catch (err) {
            document.getElementById("status").textContent =  `Error: ${err}`;
        }
    }
}
