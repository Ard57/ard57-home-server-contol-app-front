const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const DBNAME = functions.config().firestore.database;
const SERVERS_COLLECTION = functions.config().firestore.collection || "servers";

const db = getFirestore(DBNAME);

exports.connectFunction = functions.https.onCall(async (data, context) => {
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
  const displayName = context.auth.token.name || "Anonymous";
  const serverRef = db.collection(SERVERS_COLLECTION).doc(serverId);

  try {
    await db.runTransaction(async (transaction) => {
      const serverDoc = await transaction.get(serverRef);

      if (!serverDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Server with ID ${serverId} not found in database ${DBNAME || '(default)'}.`
        );
      }

      const serverData = serverDoc.data();
      const activeUsers = serverData.activeUsers || {};
      let userCount = serverData.userCount || 0;

      if (!activeUsers[uid]) {
        functions.logger.info(`New user ${uid} connecting to ${serverId}`);
        userCount += 1;
        activeUsers[uid] = displayName;

        const updateData = {
          userCount,
          activeUsers,
        };

        if (serverData.status === "offline") {
          updateData.status = "online";
        }

        transaction.update(serverRef, updateData);
      } else if (activeUsers[uid] !== displayName) {
        functions.logger.info(`Updating display name for ${uid} on ${serverId}.`);
        activeUsers[uid] = displayName;
        transaction.update(serverRef, { activeUsers });
      } else {
        functions.logger.info(`User ${uid} is already connected to ${serverId}`);
      }
    });

    return { status: "success", message: `Successfully connected to server ${serverId}` };

  } catch (error) {
    functions.logger.error(
      `Failed to connect user ${uid} to server ${serverId}`,
      error
    );
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while connecting to the server."
    );
  }
});
