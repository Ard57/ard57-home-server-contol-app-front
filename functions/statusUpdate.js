const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineString } = require('firebase-functions/params');
const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getFunctions } = require("firebase-admin/functions");

const SERVERS_COLLECTION = defineString('FIRESTORE_SERVERS_COLLECTION', {default: 'servers'});
const DATABASE_NAME = defineString('FIRESTORE_DATABASE_NAME', {default: '(default)'});

const IDLE_SHUTDOWN_DELAY_SECONDS = 10 * 60;

exports.statusUpdate = onDocumentUpdated({
    document: "servers/{serverId}/details/state",
    database: DATABASE_NAME,
    region: "europe-central2",
},
async (event) => {
    const serverId = event.params.serverId;

    const beforeData = event.data.before.data() || {};
    const afterData = event.data.after.data();
    const prevUserCount = Object.keys(beforeData.activeUsers || {}).length;
    const activeUsers = afterData.activeUsers || {};
    const userCount = Object.keys(activeUsers).length;

    const db = getFirestore(DATABASE_NAME.value());
    const serverRef = db.collection(SERVERS_COLLECTION.value()).doc(serverId);

    const updateData = { userCount };
    let emptySince = null;

    if (userCount > 0) {
        // Power on (or stay on) and cancel any pending idle shutdown.
        updateData.status = "online";
        updateData.emptySince = FieldValue.delete();
    } else if (prevUserCount > 0) {
        // Last user left: keep the server online and start the idle timer.
        emptySince = Date.now();
        updateData.emptySince = emptySince;
    }

    try {
        console.log(`Updating server ${serverId}: userCount=${userCount}`, updateData.status ? `status=${updateData.status}` : "");

        await serverRef.update(updateData);

        console.log(`Successfully synchronized server ${serverId}.`);
    } catch (error) {
        console.error(`Error synchronizing server document ${serverId}:`, error);
        return;
    }

    if (emptySince === null) {
        return;
    }

    try {
        const queue = getFunctions().taskQueue("locations/europe-central2/functions/shutdownIfIdle");
        await queue.enqueue({ serverId, emptySince }, {
            scheduleDelaySeconds: IDLE_SHUTDOWN_DELAY_SECONDS,
            // Firestore triggers are at-least-once; a fixed id dedupes retried events.
            id: `${serverId}-${emptySince}`,
        });
        console.log(`Scheduled idle shutdown check for ${serverId} in ${IDLE_SHUTDOWN_DELAY_SECONDS}s.`);
    } catch (error) {
        if (error.code === "functions/task-already-exists") {
            console.log(`Idle shutdown task for ${serverId} already scheduled.`);
        } else {
            console.error(`Error scheduling idle shutdown for ${serverId}:`, error);
        }
    }
});
