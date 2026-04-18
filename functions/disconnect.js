const functions = require("firebase-functions");
const admin = require("firebase-admin");

const DBNAME = functions.config().firestore.database;
const SERVERS_COLLECTION = functions.config().firestore.collection || "servers";

const db = DBNAME ? admin.firestore(DBNAME) : admin.firestore();

exports.disconnectFunction = functions.https.onCall(async (data, context) => {
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
  const serverRef = db.collection(SERVERS_COLLECTION).doc(serverId);

  try {
    await db.runTransaction(async (transaction) => {
      const serverDoc = await transaction.get(serverRef);

      if (!serverDoc.exists) {
        throw new functions.https.HttpsError("not-found", `Server with ID ${serverId} not found.`);
      }

      const serverData = serverDoc.data();
      const activeUsers = serverData.activeUsers || {};
      let userCount = serverData.userCount || 0;

      if (activeUsers[uid]) {
        functions.logger.info(`User ${uid} disconnecting from ${serverId}`);
        userCount -= 1;
        delete activeUsers[uid];

        const updateData = {
          userCount,
          activeUsers,
        };

        if (userCount === 0) {
          updateData.status = "offline";
        }

        transaction.update(serverRef, updateData);
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