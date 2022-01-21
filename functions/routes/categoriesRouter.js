const express = require('express');
const app = express();
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { FieldValue } = require('firebase-admin').firestore;

const categoriesRouter = (db) => {  
    router.get('/', function(req, res) {
        db.collection('categories')
            .get()
            .then(qs => qs.docs.map(doc => Object.assign({id: doc.id}, doc.data())))
            .then(docs => res.send(docs))
    });

    router.get('/:categorieId', function(req, res) {
        db.collection('categories')
            .doc(req.params.categorieId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    res.send(Object.assign({id: req.params.categorieId}, doc.data()))
                } else {
                    res.status(404).send("Document not found")
                }
            })
    });

    router.post(
        '/', 
        body('name').notEmpty().isString().escape(),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            db.collection('categories')
                .add({name: req.body["name"]})
                .then(doc => res.status(201).send(Object.assign({id: doc.id}, {name: req.body["name"]})))
            ;
        }
    );

    router.put(
        '/:categorieId', 
        body('name').notEmpty().isString().escape().optional(),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            db.collection('categories')
                .doc(req.params.categorieId)
                .update({name: req.body["name"]})
                .then(() => {
                    db.collection('categories')
                        .doc(req.params.categorieId)
                        .get()
                        .then(doc => res.status(202).send(Object.assign(req.params, doc.data())))
                })
            ;
        }
    );

    router.delete('/:categorieId', function(req, res){
        db.collection('categories').doc(req.params.categorieId).get()
        .then(doc => {    
            if (doc.exists) {
                db.collection('categories')
                    .doc(req.params.categorieId)
                    .delete()
                    .then(() => res.status(202).send("Succefully deleted !"))
            } else {
                res.status(422).send("Document doesn't exists")
            }
        })

    });

    return router;
}

module.exports = categoriesRouter;