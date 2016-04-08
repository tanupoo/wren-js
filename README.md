wren-js
=======

## TODO

- timezone conversion

## Definition of the attributes in the wrenObj object.

    ~~~~
    type: (string, required)
    
        server object type.
        either 'kiwi', 'fiap', or 'kii'
    
    query: (object, conditionally option)
    
      If you use kii type, query is required and the following attributes
      have to be defined.
    
        app_id: (string, required)
        app_key: (string, required)
        thing_token: (string, required)
        thing_id: (string, required)
        bucket_id: (string, required)
        serverURL: (string, required)
    
            e.g. 'https://api-jp.kii.com/api/apps' for KiiCloud Japan.
    
        limit: (integer, optional)
    
          the value is used for bestEffortLimit.
    
      If you use either kiwi or fiap, query object is option.
      The following attributes can be defined.
    
        serverURL: (string, optional)
    
          e.g. 'http://localhost:18880'
    
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
        e.g. tz: 9    (Asia/Tokyo)
             tz: -3.5 (Canada/Newfoundland)
             tz: 5.75 (Asia/Katmandu)

        TIPS: KiiCloud keeps data in UTC.  You should define the time
              difference of your timezone here if you use KiiCloud.
    
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
