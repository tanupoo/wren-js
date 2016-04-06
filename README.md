wren-js
=======

## TODO

## wrenObj definition

    ~~~~
    type: (string, required)
    
        server object type.
        either 'kiwi', 'fiap', or 'kii'
    
    kiwi, fiap: (object, required if type is kiwi or fiap)
    
      serverURL: (string, optional)
        e.g. 'http://localhost:18880'
    
    kii: (object, required if type is kii)
    
      app_id: (string, required)
      app_key: (string, required)
      thing_token: (string, required)
      thing_id: (string, required)
      bucket_id: (string, required)
      serverURL: (string, required)
        e.g. 'https://api-jp.kii.com/api/apps' for KiiCloud Japan.
      limit: (integer, optional)
        bestEffortLimit
    
    dataDef: (object, required)
    
      key: a list of the names of the keys.
      label: label name
      unit:
      color:
      min:
      max:
      ytick:
    
    flotDef:
    
      flot: identifier
      set:
    
    tz: (integer, optional)
    
        time difference from GMT of the server objects in hours.
        default is 0.
        e.g. tz: 9
    
    updateInterval: (integer, optional)
    
        update interval of the canvas in milliseconds.
        default is 600000 (10 minutes).
    
    xrange: (integer, optional)
    
        the range of the x-axis in milliseconds.
        default is 172800000 (2 days).
    ~~~~

## test for wren-parse-object.js

the files in the test directory can be used to check the parser with node.js.
comment out some lines in wren-parse-object.js.
