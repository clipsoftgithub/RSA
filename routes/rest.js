var express = require('express');
var db = require('../db');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var collectionName = 'support_team';

router.get('/api/tasks/today', function (req, res) {
    var start = new Date();
    var end = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    db.get().collection(collectionName).find({create: {$gte: start, $lt: end}}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});



router.get('/api/tasks/state/accept', function (req, res) {
    db.get().collection(collectionName).find({state : "접수"}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});

router.get('/api/tasks/state/process', function (req, res) {
    db.get().collection(collectionName).find({state : "진행"}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});


router.get('/api/tasks/state/finish', function (req, res) {
    db.get().collection(collectionName).find({state : "완료"}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});


/**
 * 원격지원팀에서 전화가 오면 접수 등록하는 함수.
 */
router.post('/api/tasks/register', function (req, res) {
    var record = req.body;
    record.create = new Date();
    record.member = "";
    record.method = "";
    record.btime = "";
    record.etime = "";
    record.state = "접수";
    console.log(record);
    db.get().collection(collectionName).insert(record);
    res.send("ok");
});


router.get('/api/tasks/search', function (req, res) {
    var query = req.query;
    console.log(query);

    if (query == undefined)
        query = {};

    var start = query.start || "";
    var end = query.end || "";
    if (query.start != "" && query.end != "") {
        query.create = {$gte: new Date(query.start), $lt: new Date(query.end)};
    } else if (query.start != "") {
        query.create = {$gte: new Date(query.start)};
    } else if (query.end != "") {
        query.create = {$lt: new Date(query.end)};
    }
    delete query.start;
    delete query.end;
    console.log(query);
    var result = {};
    db.get().collection(collectionName).find(query).toArray(function (err, records) {
        if (err) {
            console.log(err);
            result.result = "error";
            result.error = err;
        } else {
            result.result = "ok";
            result.records = records;
        }
        res.json(result);
    });
});


router.get('/api/tasks/search/phone/:id', function (req, res) {
    console.log(req.params.id);
    var phone = req.params.id;
    db.get().collection(collectionName).find({phone: phone}).toArray(function (err, records) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(records.pop()));
        }
    });
});

router.get('/api/tasks/search/recent/phone/:id', function (req, res) {
    console.log(req.params.id);
    var phone = req.params.id;
    db.get().collection(collectionName).find({phone: phone}).toArray(function (err, records) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(records.pop()));
        }
    });
});


router.put('/api/tasks/update/state/finish', function (req, res) {
    console.log(req.body);
    var task = req.body;
    var record = {};
    record.state = "완료";
    record.etime = new Date();
    record.result = task.result;
    db.get().collection(collectionName).update({_id: new ObjectID(task.id)}, {$set: record}, {w: 1}, function (err) {
        if (err) {
            console.warn(err.message);
        }
        else {
            res.send("ok");
        }
    });
});

module.exports = router;