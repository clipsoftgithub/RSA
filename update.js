/**
 * Created by blueeyes on 2017. 8. 21..
 */
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var activedb = null;

MongoClient.connect('mongodb://localhost:27017/clipsoft', function(err, db) {
    if (err)
        return;
    db.collection("support_team").find({}).toArray(function (err, records) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < records.length; ++i) {
                var updateCreate = records[i].create;
                var updateBTime = records[i].btime;
                var updateETime = records[i].etime;

                if (typeof(updateCreate) !== 'object')
                    updateCreate = new Date();

                if (typeof (updateBTime) !== 'object')
                    updateBTime = new Date();

                if (typeof(updateETime) !== 'object') {
                    updateETime = new Date();
                }


                updateCreate.setHours((updateCreate.getHours() - updateCreate.getTimezoneOffset() / 60));
                updateBTime.setHours((updateBTime.getHours() - updateBTime.getTimezoneOffset() / 60));
                updateETime.setHours((updateETime.getHours() - updateETime.getTimezoneOffset() / 60));


                db.collection("support_team").update({_id : new ObjectID(records[i]._id)}, {$set : records[i]}, {w:1}, function(err) {
                   if (err)
                       console.log(err);
                });


            }
        }
    });

});