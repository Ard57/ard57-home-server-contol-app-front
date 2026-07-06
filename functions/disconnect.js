const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const DBNAME = process.env.FIRESTORE_DATABASE_NAME || '(default)';
const SERVERS_COLLECTION = process.env.FIRESTORE_SERVERS_COLLECTION;

const db = getFirestore(DBNAME);

exports.disconnectFunction = functions.region('europe-central2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { serverId } = data;
  if (!serverId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a \'serverId\' argument."
    );
  }

  const { uid } = context.auth;
  const stateRef = db.collection(SERVERS_COLLECTION).doc(serverId).collection("details").doc("state");

  try {
    await db.runTransaction(async (transaction) => {
      const stateDoc = await transaction.get(stateRef);

      if (!stateDoc.exists) {
        functions.logger.info(`State document for ${serverId} does not exist, nothing to disconnect.`);
        return;
      }

      const stateData = stateDoc.data();
      const activeUsers = stateData.activeUsers || {};

      if (activeUsers[uid]) {
        functions.logger.info(`User ${uid} disconnecting from ${serverId}`);
        delete activeUsers[uid];

        transaction.update(stateRef, { activeUsers });
      } else {
        functions.logger.info(`User ${uid} is not connected to ${serverId}`);
      }
    });

    return { status: "success", message: `Successfully disconnected from server ${serverId}` };

  } catch (error) {
    functions.logger.error(
      `Failed to disconnect user ${uid} from server ${serverId}`,
      error
    );
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while disconnecting from the server."
    );
  }
});