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