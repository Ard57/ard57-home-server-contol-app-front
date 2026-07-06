const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineString } = require('firebase-functions/params');
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const SERVERS_COLLECTION = defineString('FIRESTORE_SERVERS_COLLECTION', {default: 'servers'});
const DATABASE_NAME = defineString('FIRESTORE_DATABASE_NAME', {default: '(default)'});

exports.statusUpdate = onDocumentUpdated({
    document: "servers/{serverId}/details/state",
    database: DATABASE_NAME,
    region: "europe-central2",
},
async (event) => {
    const serverId = event.params.serverId;

    const afterData = event.data.after.data();
    const activeUsers = afterData.activeUsers || {};
    const userCount = Object.keys(activeUsers).length;
    const newStatus = userCount > 0 ? "online" : "offline";

    const db = getFirestore(DATABASE_NAME.value());
    const serverRef = db.collection(SERVERS_COLLECTION.value()).doc(serverId);

    try {
        console.log(`Updating server ${serverId}: userCount=${userCount}, status=${newStatus}`);
        
        await serverRef.update({
            userCount: userCount,
            status: newStatus,
        });

        console.log(`Successfully synchronized server ${serverId}.`);
    } catch (error) {
        console.error(`Error synchronizing server document ${serverId}:`, error);
    }
});