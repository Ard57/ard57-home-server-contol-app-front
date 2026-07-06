const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

const { connectFunction } = require("./connect.js");
const { disconnectFunction } = require("./disconnect.js");
const { statusUpdate } = require("./statusUpdate.js");

exports.connect = connectFunction;
exports.disconnect = disconnectFunction;
exports.statusUpdate = statusUpdate;
