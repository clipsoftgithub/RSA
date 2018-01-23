## npm 
``` bash  
  $ npm ls -g
  $ npm ls -g --depth= 0
```  
  
## forever Install

``` bash
  $ npm install forever -g 
```

## forever start

``` bash
  $ forever start ./bin/www
```

## forever 
``` bash
$ forever --version
v0.15.1

$ forever start -c "npm start" /some/dir
...bash
info:    Forever processing file: /some/dir/

$ forever list
info:    Forever processes running
data:        uid  command   script     forever pid  id logfile                    uptime      
data:    [0] 9T8K npm start /some/dir/ 8031    8048    /home/me/.forever/9T8K.log 0:0:0:9.371 

$ forever stop 0
info:    Forever stopped process:
    uid  command   script     forever pid  id logfile                    uptime       
[0] 9T8K npm start /some/dir/ 8031    8048    /home/me/.forever/9T8K.log 0:0:0:23.884 

$ forever list
info:    No forever processes running

$ ps aux | grep 'forever\|node'
me     8065  0.0  0.0   4444   660 ?        S    14:00   0:00 sh -c NODE_PATH=$NODE_PATH:./modules node .
me     8066  0.0  0.4 705192 37700 ?        Sl   14:00   0:00 node .
me     8531  0.0  0.0  15944   944 pts/27   S+   14:14   0:00 grep --color=auto forever\|node

$ ps kill 8066
```

## mongodb
```bash

 $ service mongod stop
 $ service mongod start

```

## mongodb SQL
|SQL Statement|MongoDB Statement|
|---|---|
|CREATE TALE USERS (a int, b int)|db.createCollection("mycoll") |
|INSERT INTO USERS VALUES (3,5)|db.users.insert({a:3, b:5}) |
|SELECT a, b FROM USERS|db.users.find({}, {a:1, b:1}) |
|SELECT * FROM users|db.users.find()|
|SELECT * FROM users WHERE age=33|db.users.find({age:33})|
|SELECT a,b FROM users WHERE age=33|db.users.find({age:33}, {a:1,b:1})|
|SELECT * FROM users WHERE age=33 ORDER BY name|db.users.find({age:33}).sort({name:1})|
|SELECT * FROM users WHERE age>33|db.users.find({'age':{$gt:33}})|
|SELECT * FROM users WHERE age<33|db.users.find({'age':{$lt:33}})|
|SELECT * FROM users WHERE name LIKE"%Joe%"|db.users.find({name:/Joe/})|
|SELECT * FROM users WHERE name LIKE "Joe%"|db.users.find({name:/^Joe/})|
|SELECT * FROM users WHERE age>33 AND age<=40|db.users.find({'age':{$gt:33,$lte:40}})|
|SELECT * FROM users ORDER BY name DESC|db.users.find().sort({name:-1})|
|SELECT * FROM users WHERE a=1 and b='q'|db.users.find({a:1,b:'q'})|
|SELECT * FROM users LIMIT 10 SKIP 20|SELECT * FROM users LIMIT 10 SKIP 20|
|SELECT * FROM users WHERE a=1 or b=2|db.users.find( { $or : [ { a : 1 } , { b : 2 } ] } )|
|SELECT * FROM users LIMIT 1|db.users.findOne()|
|SELECT DISTINCT last_name FROM users|db.u결sers.distinct('last_name')|
|SELECT COUNT(*y) FROM users|db.users.count()|
|SELECT COUNT(*y) FROM users where AGE > 30|db.users.find({age: {'$gt': 30}}).count()|
|SELECT COUNT(AGE) from users	 db.users.find({age: {'$exists': true}}).count()|
|CREATE INDEX myindexname ON users(name)|db.users.ensureIndex({name:1})|
|CREATE INDEX myindexname ON users(name,ts DESC)|db.users.ensureIndex({name:1,ts:-1})|
|EXPLAIN SELECT * FROM users WHERE z=3|db.users.find({z:3}).explain()|
|UPDATE users SET a=1 WHERE b='q'|db.users.update({b:'q'}, {$set:{a:1}}, false, true)|
|UPDATE users SET a=a+2 WHERE b='q'|db.users.update({b:'q'}, {$inc:{a:2}}, false, true)|
|DELETE FROM users WHERE z="abc"|db.users.remove({z:'abc'});|


## 몽고디비 백업
mongodump --out ~/clipsoft/RSAMongobackup/20171116
mongodump --out ~/clipsoft/RSAMongobackup/20171205
mongodump --out ~/clipsoft/RSAMongobackup/20180123