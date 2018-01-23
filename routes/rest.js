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
    start = applyTimezoneOffset(start);
    end = applyTimezoneOffset(end);

    db.get().collection(collectionName).find({create: {$gte: start, $lt: end}}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            console.log("/api/tasks/today -> record count : " + docs.length);
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


/**
 * 특정 원격지원 작업의 내용을 변경함.
 */
router.post('/api/tasks/edit', function (req, res) {
    console.log(req.body);
    var task = req.body;
    db.get().collection(collectionName).update({_id: new ObjectID(task.id)}, {$set: task}, {w: 1}, function (err) {
        if (err) {
            console.warn(err.message);
        }
        else {
            res.send("ok");
        }
    });
});


router.delete('/api/tasks/:id', function (req, res) {
    console.log(req.params.id);
    db.get().collection(collectionName).remove({_id: new ObjectID(req.params.id)}, function (err, records) {
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

    //
    // 지원 날짜로 검색하는 경우 달리 처리하도록 함
    //
    if (query.type !== undefined && query.type === "day") {
        var start = new Date(query.start);
        var end = new Date(query.start);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        query = {create: {$gte: start, $lt: end}};
    } else {
        var start = new Date(query.start || "");
        var end = new Date(query.end || "");
        if (query.start != "" && query.end != "") {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            query.create = {$gte: start, $lt: end};
        } else if (query.start != "") {
            start.setHours(0, 0, 0, 0);
            query.create = {$gte: start};
        } else if (query.end != "") {
            end.setHours(23, 59, 59, 999);
            query.create = {$lt: end};
        }
        delete query.start;
        delete query.end;
    }

    // 쿼리에 포함된 날짜를 타임존을 적용하여 변경한다.
    if (query.create != undefined && query.create.$gte != undefined)
        query.create.$gte = applyTimezoneOffset(query.create.$gte);

    if (query.create != undefined && query.create.$lt != undefined)
        query.create.$lt = applyTimezoneOffset(query.create.$lt);


    if (query.content != undefined && query.content != "") {
        query.result = {$regex : query.content};
        delete query.content;
    }

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
 * 원격지원 작업을 업데이트하는 함수.
 */
router.put('/api/tasks', function (req, res) {
    var query = req.body;
    console.log(query);

    if (query == undefined)
        query = {};

    var id = query._id;
    if (id === undefined || id === '') {
        console.error('id is null');
        return;
    }

    delete query._id;
    try {
        db.get().collection(collectionName).update({_id: new ObjectID(id)}, {$set: query});
    } catch(e) {
        console.warn(e);
    }
    res.send("ok");
});



/**
 * 원격지원팀 주간보고용으로 만든 함수.
 */
router.get('/api/tasks/search/weekly', function (req, res) {
    var query = req.query;
    console.log(query);

    if (query == undefined)
        query = {};

    //
    // 지원 날짜로 검색하는 경우 달리 처리하도록 함
    //
    if (query.type !== undefined && query.type === "day") {
        var start = new Date(query.start);
        var end = new Date(query.start);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        query = {create: {$gte: start, $lt: end}};
    } else {
        var start = new Date(query.start || "");
        var end = new Date(query.end || "");
        if (query.start != "" && query.end != "") {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            query.create = {$gte: start, $lt: end};
        } else if (query.start != "") {
            start.setHours(0, 0, 0, 0);
            query.create = {$gte: start};
        } else if (query.end != "") {
            end.setHours(23, 59, 59, 999);
            query.create = {$lt: end};
        }
        delete query.start;
        delete query.end;
    }

    // 쿼리에 포함된 날짜를 타임존을 적용하여 변경한다.
    if (query.create != undefined && query.create.$gte != undefined)
        query.create.$gte = applyTimezoneOffset(query.create.$gte);

    if (query.create != undefined && query.create.$lt != undefined)
        query.create.$lt = applyTimezoneOffset(query.create.$lt);

    console.log(query);

    var result = {};
    db.get().collection(collectionName).aggregate([
        {
            $match: query
        },
        {
            $project: {
                "month": {$month: "$create"},
                "day": {$dayOfMonth: "$create"},
                "member": "$member",
                "product": "$product"
            }
        },
        {
            $group: {
                _id: {member: "$member", month: "$month", day: "$day"}, total: {$sum: 1},
                rexpert25: {
                    $sum: {$cond: [{$eq: ["$product", "렉스퍼트 2.5"]}, 1, 0]}
                },
                rexpert30: {
                    $sum: {$cond: [{$eq: ["$product", "렉스퍼트 3.0"]}, 1, 0]}
                },
                clipreport40: {
                    $sum: {$cond: [{$eq: ["$product", "클립리포트 4.0"]}, 1, 0]}
                },
                clipreport40daemon: {
                    $sum: {$cond: [{$eq: ["$product", "클립리포트 4.0 데몬"]}, 1, 0]}
                },
                webeform: {
                    $sum: {$cond: [{$eq: ["$product", "웹이폼"]}, 1, 0]}
                },
            }
        },
        {
            $sort : {"_id.month": 1, "_id.day" : 1}
        },

    ]).toArray(function (err, records) {
        if (err) {
            console.log(err);
            result.result = "error";
            result.error = err;
        } else {
            result.result = "ok";
            result.records = records;
        }
        if (result.records != undefined) {
            result.records.forEach(function (record, index) {
                record.member = record._id.member;
                record.month = record._id.month;
                record.day = record._id.day;
                delete record._id;
            });
        }
        console.log(records);
        res.json(result);
    });


    // 그룹핑하는 다른 방법 중에 하나 나중에 참고용으로
    // db.get().collection(collectionName).aggregate([
    //     {$match: query},
    //     {
    //         $project: {
    //             "totalAmount": 1,
    //             "month": {$month: "$create"},
    //             "day": {$dayOfMonth: "$create"},
    //             "member": "$member",
    //             "product": "$product"
    //         }
    //     },
    //     {
    //         $group: {
    //             _id: {member: "$member", month: "$month", day: "$day"}, total: {$sum: 1},
    //             rexpert25: {
    //                 $sum: {
    //                     $switch: {
    //                         branches: [
    //                             {
    //                                 "case": {$eq: ["$product", "렉스퍼트 2.5"]},
    //                                 "then": 1
    //                             }
    //                         ],
    //                         default: 0
    //                     }
    //                 }
    //             },
    //             rexpert30: {
    //                 $sum: {
    //                     $switch: {
    //                         branches: [
    //                             {
    //                                 "case": {$eq: ["$product", "렉스퍼트 3.0"]},
    //                                 "then": 1
    //                             }
    //                         ],
    //                         default: 0
    //                     }
    //                 }
    //             },
    //             clipreport40: {
    //                 $sum: {
    //                     $switch: {
    //                         branches: [
    //                             {
    //                                 "case": {$eq: ["$product", "클립리포트 4.0"]},
    //                                 "then": 1
    //                             }
    //                         ],
    //                         default: 0
    //                     }
    //                 }
    //             },
    //             clipreport40daemon: {
    //                 $sum: {
    //                     $switch: {
    //                         branches: [
    //                             {
    //                                 "case": {$eq: ["$product", "클립리포트 4.0 데몬"]},
    //                                 "then": 1
    //                             }
    //                         ],
    //                         default: 0
    //                     }
    //                 }
    //             },
    //             webeform: {
    //                 $sum: {
    //                     $switch: {
    //                         branches: [
    //                             {
    //                                 "case": {$eq: ["$product", "웹이폼"]},
    //                                 "then": 1
    //                             }
    //                         ],
    //                         default: 0
    //                     }
    //                 }
    //             },
    //         }
    //     }
    // ]).toArray(function (err, records) {
    //     if (err) {
    //         console.log(err);
    //         result.result = "error";
    //         result.error = err;
    //     } else {
    //         result.result = "ok";
    //         result.records = records;
    //     }
    //     if (result.records != undefined) {
    //         result.records.forEach(function (record, index) {
    //             record.member = record._id.member;
    //             record.month = record._id.month;
    //             record.day = record._id.day;
    //             delete record._id;
    //         });
    //     }
    //     console.log(records);
    //     res.json(result);
    // });


});



/**
 * 원격지원팀 통계용으로 만든 함수.
 */
router.get('/api/tasks/statistics', function (req, res) {
    var query = req.query;
    console.log(query);

    if (query == undefined)
        query = {};


    var start = new Date(query.start || "");
    var end = new Date(query.end || "");
    var key = query.key;
    if (query.start != "" && query.end != "") {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        query.create = {$gte: start, $lt: end};
    } else if (query.start != "") {
        start.setHours(0, 0, 0, 0);
        query.create = {$gte: start};
    } else if (query.end != "") {
        end.setHours(23, 59, 59, 999);
        query.create = {$lt: end};
    }
    delete query.key;
    delete query.start;
    delete query.end;


    // 쿼리에 포함된 날짜를 타임존을 적용하여 변경한다.
    if (query.create != undefined && query.create.$gte != undefined)
        query.create.$gte = applyTimezoneOffset(query.create.$gte);

    if (query.create != undefined && query.create.$lt != undefined)
        query.create.$lt = applyTimezoneOffset(query.create.$lt);

    console.log(query);

    var result = {};
    db.get().collection(collectionName).aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: {key: '$' + key},
                total: {
                    $sum: 1
                },
                rexpert25: {
                    $sum: {$cond: [{$eq: ["$product", "렉스퍼트 2.5"]}, 1, 0]}
                },
                rexpert30: {
                    $sum: {$cond: [{$eq: ["$product", "렉스퍼트 3.0"]}, 1, 0]}
                },
                clipreport40: {
                    $sum: {$cond: [{$eq: ["$product", "클립리포트 4.0"]}, 1, 0]}
                },
                clipreport40daemon: {
                    $sum: {$cond: [{$eq: ["$product", "클립리포트 4.0 데몬"]}, 1, 0]}
                },
                webeform: {
                    $sum: {$cond: [{$eq: ["$product", "웹이폼"]}, 1, 0]}
                },
            }
        },
        {
            $sort : {"total": -1}
        },

    ]).toArray(function (err, records) {
        if (err) {
            console.log(err);
            result.result = "error";
            result.error = err;
        } else {
            result.result = "ok";
            result.records = records;
        }
        if (result.records != undefined) {
            result.records.forEach(function (record, index) {
                record.key = record._id.key;
                delete record._id;
            });
        }
        console.log(records);
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
    record.btime = applyTimezoneOffset(new Date(task.btime));
    record.etime = applyTimezoneOffset(new Date(task.etime));
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
    db.get().collection(collectionName).distinct("name", function (err, records) {
        if (err) {
            console.log(err);
        } else {
            records.sort();
            res.send(JSON.stringify(records));
        }
    });
});

module.exports = router;