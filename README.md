wren-js
=======

## Usage

- include javascripts in your HTML file.

    ~~~~
    <script type="text/javascript" src="wren/wren-parse-object.js"></script>
    <script type="text/javascript" src="wren/wren-query.js"></script>
    <script type="text/javascript" src="wren/wren-graph-20160324.js"></script>
    <link rel="stylesheet" type="text/css" href="wren/wren-base.css">
    ~~~~

- include JSON file in your HTML file that defines wrenObj.

    ~~~~
    <script type="text/javascript" src="kii-cloud-demo-20160321.js"></script>
    ~~~~

- put some panels for flot in your HTML file.

    ~~~~
    <div id="flot01" class="classFlotBox"></div>
    ~~~~

- put the control panel in your HTML file if you need.

    ~~~~
      <div class="classRowPanel">
        <div class="classInputPanel">
          <div class="classInputBox">
            <button id="btnStart" class="classButton" type="button">Start</button>
            <button id="btnStop" class="classButton" type="button">Stop</button>
          </div>
          <div class="classLeftAlignedPanel">
            <div class="classInputBox">
              Date and Time :
              <input id="inputDateTime" type="text" size="42" value="current" readon
    ly>     
            </div>
            <div class="classInputBox">
              <input id="inputRefresh" type="checkbox" value="refresh">
              Refresh the lines when clicking the start button.
            </div>
            <div class="classInputBox">
              <input id="inputRetry" type="checkbox" value="retry" checked>
              Retry anyway even if something network error happens.
            </div>
          </div>
        </div>
      </div>
    ~~~~

- put the console for showing information in your HTML file.

    ~~~~
    <div id="divConsole" class="classRowPanel"> </div>
    ~~~~

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

## wren-base.css

- divBasePanel
- classColumnPanel
- classRowPanel
- classFlotPanel
- classFlotBox
- classInputPanel
- classLeftAlignedPanel
- classInputBox
- divConsole

## Assumption of the response from the servers.

### kiwi

- Example

    ~~~~
    {
      "kiwi": {
        "version": "20140401",
        "point": {
          "http://fiap.tanu.org/test/alps/f1/temperature/mean":
            [ { "time":"2016-03-23T10:59:18.000+0900", "value":"20" } ],
          "http://fiap.tanu.org/test/alps/f1/temperature/max":
            { "time":"2016-03-23T10:59:18.000+0900", "value":"20" },
          "http://fiap.tanu.org/test/alps/f1/temperature/min":
            { "time":"2016-03-23T10:59:18.000+0900", "value":"20" }
        }
      }
    }
    ~~~~

### IEEE1888

- Example

    ~~~~
    {
      "fiap": {
        "version": "20140401",
        "queryRS": {
          "status": "200 OK",
          "point": {
            "http://fiap.tanu.org/test/alps/f1/temperature/mean":
              [ { "time":"2016-03-23T10:59:18.000+0900", "value":"20" } ],
            "http://fiap.tanu.org/test/alps/f1/temperature/max":
              { "time":"2016-03-23T10:59:18.000+0900", "value":"20" },
            "http://fiap.tanu.org/test/alps/f1/temperature/min":
              { "time":"2016-03-23T10:59:18.000+0900", "value":"20" }
          }
        }
      }
    }
    ~~~~

### KiiCloud

    ~~~~
    {
      "queryDescription": "",
      "results":
        {
          "kii": {
            "version": "20160301",
            "produced": 1458698970000,
            "point": {
              "http://fiap.tanu.org/test/alps/f1/temperature/mean":
                [ { "time":"2016-03-23T10:59:18.000+0900", "value":"20" } ],
              "http://fiap.tanu.org/test/alps/f1/temperature/max":
                { "time":"2016-03-23T10:59:18.000+0900", "value":"30" },
              "http://fiap.tanu.org/test/alps/f1/temperature/min":
                { "time":"2016-03-23T10:59:18.000+0900", "value":"10" }
            }
          }
        }
    }
    ~~~~

## TODO

- a serialize function should be done in each protocol function.
- tz should be a timezone string.
- timezone conversion correctly. it seems there might be a bug.

## test for wren-parse-object.js

the files in the test directory can be used to check the parser with node.js.
comment out some lines in wren-parse-object.js.
