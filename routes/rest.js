var express = require('express');
var db = require('../db');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var collectionName = 'support_team';


function applyTimezoneOffset(date) {
    date.setHours((date.getHours() - date.getTimezoneOffset() / 60));
    return date;
}

/**
 * 오늘 날짜 원격지원 작업을 리턴하는 함수. 여기서 오늘 날짜는 서버 날짜를 기준으로 함.
 */
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


/**
 * "접수" 상태에 있는 모든 원격지원 작업을 리턴하는 함수.
 */
router.get('/api/tasks/state/accept', function (req, res) {
    db.get().collection(collectionName).find({state: "접수"}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});

/**
 * "진행" 상태에 있는 모든 원격지원 작업을 리턴하는 함수
 */
router.get('/api/tasks/state/process', function (req, res) {
    db.get().collection(collectionName).find({state: "진행"}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});

/**
 * "완료" 상태에 있는 모든 원격지원 작업을 리턴하는 함수.
 */
router.get('/api/tasks/state/finish', function (req, res) {
    db.get().collection(collectionName).find({state: "완료"}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(docs));
        }
    });
});


/**
 * 원격지원 작업을 등록하는 함수. 원격지원 작업의 초기 상태는 "접수"가 됨.
 */
router.post('/api/tasks/register', function (req, res) {
    var record = req.body;
    record.create = applyTimezoneOffset(new Date());
    record.member = "";
    record.method = "";
    record.btime = new Date();
    record.etime = new Date();
    record.state = "접수";
    console.log(record);
    db.get().collection(collectionName).insert(record);
    res.send("ok");
});


router.delete('/api/tasks/:id', function (req, res) {
    console.log(req.params.id);
    db.get().collection(collectionName).remove({_id: new ObjectID(req.params.id)}, function(err, records) {
        if (err) {
            console.log(err);
        }
    });
    res.send("ok");
});


/**
 * 원격지원 작업을 검색하는 함수.
 */
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

/**
 * 전화번호로 원격지원 작업을 검색하는 헬프 함수 - 작업 등록(register.html)에서 사용함.
 */
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

/**
 * 전화번호로 원격지원 최근 작업을 검색하는 헬프 함수 - 작업 등록(register.html)에서 사용함.
 */
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

/**
 * 특정 원격지원 작업의 상태를 "완료"로 변경하는 함수.
 */
router.put('/api/tasks/update/state/finish', function (req, res) {
    console.log(req.body);
    var task = req.body;
    var record = {};
    record.state = "완료";
    record.etime = applyTimezoneOffset(new Date());
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

/**
 * 전체 원격지원 작업에서 고유한 회사명만을 리턴하는 함수.
 */
router.get('/api/distinct/company', function (req, res) {
    db.get().collection(collectionName).distinct("company", function (err, records) {
        if (err) {
            console.log(err);
        } else {
            records.sort();
            res.send(JSON.stringify(records));
        }
    });
});

/**
 * 전체 원격지원 작업에서 고유한 프로젝트만을 리턴하는 함수.
 */
router.get('/api/distinct/project', function (req, res) {
    db.get().collection(collectionName).distinct("project", function (err, records) {
        if (err) {
            console.log(err);
        } else {
            records.sort();
            res.send(JSON.stringify(records));
        }
    });
});

/**
 * 전체 원격지원 작업에서 고유한 사용자만을 리턴하는 함수.
 */
router.get('/api/distinct/name', function (req, res) {
    db.get().collection(collectionName).distinct("name",  function (err, records) {
        if (err) {
            console.log(err);
        } else {
            records.sort();
            res.send(JSON.stringify(records));
        }
    });
});

module.exports = router;