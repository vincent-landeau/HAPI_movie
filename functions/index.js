const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require('express');
const moviesRouter = require("./routes/moviesRouter");
const categoriesRouter = require("./routes/categoriesRouter");

const app = express();
app.use(express.json());


admin.initializeApp(functions.config().firebase);
const db = admin.firestore();


// MOVIES 
app.use('/v1/movies', moviesRouter(db));

// CATEGORIES
app.use('/v1/categories', categoriesRouter(db));

app.get('/v1/teapot', function(req, res) {
    res.status(418).send("Un café ?")
});

exports.api = functions.region('europe-west3').https.onRequest(app)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
