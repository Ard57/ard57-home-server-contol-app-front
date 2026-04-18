const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

const { connectFunction } = require("./connect.js");
const { disconnectFunction } = require("./disconnect.js");

exports.connect = connectFunction;
exports.disconnect = disconnectFunction;