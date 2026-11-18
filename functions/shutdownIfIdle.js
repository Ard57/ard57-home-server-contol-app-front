const { onTaskDispatched } = require("firebase-functions/v2/tasks");
const { defineString } = require('firebase-functions/params');
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { callServerApi } = require("./serverApi.js");

const SERVERS_COLLECTION = defineString('FIRESTORE_SERVERS_COLLECTION', {default: 'servers'});
const DATABASE_NAME = defineString('FIRESTORE_DATABASE_NAME', {default: '(default)'});

exports.shutdownIfIdle = onTaskDispatched({
    region: "europe-central2",
    retryConfig: {
        maxAttempts: 3,
        minBackoffSeconds: 30,
    },
    rateLimits: {
        maxConcurrentDispatches: 5,
    },
},
async (req) => {
    const { serverId, emptySince } = req.data;

    const db = getFirestore(DATABASE_NAME.value());
    const serverRef = db.collection(SERVERS_COLLECTION.value()).doc(serverId);

    const shouldShutdown = await db.runTransaction(async (transaction) => {
        const serverDoc = await transaction.get(serverRef);

        if (!serverDoc.exists) {
            console.log(`Server ${serverId} no longer exists, skipping shutdown.`);
            return false;
        }

        const serverData = serverDoc.data();

        // A different (or missing) emptySince means users came back since this
        // task was scheduled; a newer task owns the shutdown, if any.
        if (serverData.userCount > 0 || serverData.emptySince !== emptySince) {
            console.log(`Server ${serverId} is no longer idle since ${emptySince}, skipping shutdown.`);
            return false;
        }

        // emptySince is kept so a retry after a failed power-off still passes the
        // check above; statusUpdate clears it when a user connects.
        console.log(`Server ${serverId} idle since ${emptySince}, shutting down.`);
        transaction.update(serverRef, { status: "offline" });
        return true;
    });

    if (shouldShutdown) {
        // Throwing lets Cloud Tasks retry the power-off.
        await callServerApi(serverRef, "power-off");
    }
});
