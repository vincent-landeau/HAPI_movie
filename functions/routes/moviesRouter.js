const express = require('express');
const app = express();
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { FieldValue } = require('firebase-admin').firestore;


const moviesRouter = (db) => {
    router.get('/', function(req, res) {
        db.collection('movies')
            .get()
            .then(qs => qs.docs.map(doc => Object.assign({id: doc.id}, doc.data())))
            .then(docs => res.send(docs))
    });

    router.get('/:movieId', function(req, res){
        db.collection('movies')
            .doc(req.params.movieId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    res.send(Object.assign({id: req.params.movieId}, doc.data()))
                } else {
                    res.status(404).send("Document not found")
                }
            });
    });

    router.post(
        '/', 
        body('name').notEmpty().isString().escape(),
        body('author').notEmpty().isString().escape(),
        body('img').trim().notEmpty().isURL().escape(),
        body('video').trim().notEmpty().isURL().escape(),
        body('category').trim().notEmpty().isString().escape().isLength(20),
        body('description').notEmpty().isString().escape(),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const args = {
                name: req.body["name"],
                author: req.body["author"],
                img: req.body["img"],
                video: req.body["video"],
                category: req.body["category"],
                description: req.body["description"],
                like: 0
            };
            db.collection('movies')
                .add(args)
                .then(doc => res.status(201).send(Object.assign({id: doc.id}, args)))
            ;
        }
    );

    router.patch(
        '/:movieId', 
        body('name').notEmpty().isString().escape().optional(),
        body('author').notEmpty().isString().escape().optional(),
        body('img').trim().notEmpty().isURL().escape().optional(),
        body('video').trim().notEmpty().isURL().escape().optional(),     
        body('category').trim().notEmpty().isString().escape().optional(),
        body('description').notEmpty().isString().escape().optional(),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            db.collection('movies')
                .doc(req.params.movieId)
                .update(req.body)
                .then(() => {
                    db.collection('movies')
                        .doc(req.params.movieId)
                        .get()
                        .then(doc => res.status(202).send(Object.assign({id: req.params.movieId}, doc.data())))
                })
            ;
        }
    );

    router.patch('/:movieId/like', function(req, res){
        db.collection('movies').doc(req.params.movieId).get()
        .then(doc => {  
            if (doc.exists) {
                db.collection('movies')
                    .doc(req.params.movieId)
                    .update({
                        like: FieldValue.increment(1)
                    })
                    .then(() => {
                        db.collection('movies')
                            .doc(req.params.movieId)
                            .get()
                            .then(doc => res.status(202).send(Object.assign({id: req.params.movieId}, doc.data())))
                    });
                } else {
                    res.status(422).send("Document doesn't exists")
                }
        })
    });

    router.delete('/:movieId', function(req, res){
        db.collection('movies').doc(req.params.movieId).get()
        .then(doc => {    
            if (doc.exists) {
                db.collection('movies')
                    .doc(req.params.movieId)
                    .delete()
                    .then(() => res.status(202).send("Succefully deleted !"))
            } else {
                res.status(422).send("Document doesn't exists")
            }
        })

    });

    return router;
};

module.exports = moviesRouter;