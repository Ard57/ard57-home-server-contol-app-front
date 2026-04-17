const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

const { connectFunction } = require("./connect.js");

exports.connect = connectFunction;