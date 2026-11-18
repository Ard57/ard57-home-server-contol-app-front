const API_TIMEOUT_MS = 15 * 1000;

// Calls a server's control endpoint, as configured in servers/{serverId}/details/api.
// `action` is a field name in that document, e.g. "power-on" or "power-off".
exports.callServerApi = async (serverRef, action) => {
    const apiDoc = await serverRef.collection("details").doc("api").get();

    if (!apiDoc.exists) {
        console.log(`No API configured for server ${serverRef.id}, skipping ${action}.`);
        return;
    }

    const { url, [action]: path } = apiDoc.data();
    if (!url || !path) {
        console.log(`No ${action} endpoint configured for server ${serverRef.id}, skipping.`);
        return;
    }

    const endpoint = new URL(path, url);
    console.log(`Calling ${action} for server ${serverRef.id}: ${endpoint}`);

    const response = await fetch(endpoint, {
        method: "POST",
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(`${action} for server ${serverRef.id} failed: ${response.status} ${await response.text()}`);
    }

    console.log(`${action} for server ${serverRef.id} succeeded: ${response.status}`);
};
