var express = require('express');
var db = require('../db');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

router.get('/', function (req, res, next) {
    var id = req.param('task');
    var member = req.param('member');
    var record = {};
    if(member != "" && member != undefined) {
        record.member = member;
        record.state = "진행";
        record.btime = new Date();
        record.etime = new Date();
        db.get().collection('support_team').update({_id: new ObjectID(id)}, {$set: record}, {w: 1}, function (err) {
            if (err) {
                console.warn(err.message);
            }
            else {
                console.log('successfully updated');
            }
        });
    }

    db.get().collection('support_team').find({_id: new ObjectID(id)}).limit(1).toArray(function (err, record) {
        if (err) {
            console.warn(err.message);
        } else {
            console.log(record);
            res.render('process', {task: record[0]});
        }
    });
});

module.exports = router;