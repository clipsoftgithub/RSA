var express = require('express');
var db = require('../db');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

function applyTimezoneOffset(date) {
    date.setHours((date.getHours() - date.getTimezoneOffset() / 60));
    return date;
}

router.get('/', function (req, res, next) {
    var id = req.param('task');
    var member = req.param('member');
    var record = {};

    function searchTask(id) {
        db.get().collection('support_team').find({_id: new ObjectID(id)}).limit(1).toArray(function (err, record) {
            if (err) {
                console.error(err.message);
            } else {
                res.render('process', {task: record[0]});
            }
        });
    };

    if (member != "" && member != undefined) {
        record.member = member;
        record.state = "진행";
        record.btime = applyTimezoneOffset(new Date());
        record.etime = applyTimezoneOffset(new Date());
        db.get().collection('support_team').update({_id: new ObjectID(id)}, {$set: record}, {w: 1}, function (err) {
            if (err) {
                console.error(err.message);
            }
            else {
                searchTask(id);
            }
        });
    } else {
        searchTask(id);
    }
});

module.exports = router;