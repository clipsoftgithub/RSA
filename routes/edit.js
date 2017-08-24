var express = require('express');
var db = require('../db');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

router.get('/', function (req, res, next) {
    var id = req.param('task');
    db.get().collection('support_team').find({_id: new ObjectID(id)}).limit(1).toArray(function (err, record) {
        if (err) {
            console.warn(err.message);
        } else {
            console.log(record);
            res.render('edit', {task: record[0]});
        }
    });
});

module.exports = router;