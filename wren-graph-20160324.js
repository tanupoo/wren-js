/*
 * Copyright (C) 2010 Shoichi Sakane <sakane@tanu.org>, All rights reserved.
 * See the file LICENSE in the top level directory for more details.
 */

//==== DONT TOUCH BELOW ===
//==== INTERNAL USE ===
/*
 * tzOffset: (integer, internally)
 * firstRetrieve: (integer, internally)
 * totalPoints: (integer, internally)
 *     the number of total points in the canvas.
 *     288 points will be plotted if both xrange and updateInterval are default.
 * xtickFormat:
 * xtickSize:
 * flotXAxisBase:
 * flotSeriesBase:
 * flotLegendBase:
 * flotGridBase:
 * errorbarPointStyle:
 */

function print_log(m, critical)
{
  if (critical) {
    document.getElementById("divConsole").style.color = "#ff0000";
  } else {
    document.getElementById("divConsole").style.color = "#000000";
  }
  document.getElementById("divConsole").innerHTML = m.bold();
}

function fatal_error(m)
{
  print_log(m, true);
  throw 'aborted';
}

/*
 * initialization
 */
var _wrenDataSet = [];
var _wrenEvTimeout = null;

/*
 * XXX need to check the contents of wrenObj.
 */
function wren_init()
{
  if (typeof(wrenObj) == 'undefined') {
    fatal_error('ERROR: wrenObj.type must be defined.');
  }

  /* check whether type exists */
  if (typeof(wrenObj.type) == 'undefined') {
    console.log('ERROR: wrenObj.type must be defined.');
  }

  /* check type and set query attributes */
  if (wrenObj.type == 'kiwi') {
    kiwi_init(wrenObj);
  } else if (wrenObj.type == 'fiap') {
    fiap_init(wrenObj);
  } else if (wrenObj.type == 'kii') {
    kii_init(wrenObj);
  } else {
    console.log('ERROR: wrenObj.type must be either kiwi, fiap, or kii.');
  }

  /* check wrenObj.tz */
  if (typeof(wrenObj.tz) == 'undefined') {
    wrenObj.tz = 0;
  }
  wrenObj.tzOffset = (wrenObj.tz * 3600000); // wrenObj.tz * 60 * 60 * 1000

  /* check wrenObj.updateInterval and wrenObj.totalPoints */
  if (!wrenObj.hasOwnProperty('updateInterval')) {
    wrenObj.updateInterval = 600000;
  }
  if (!wrenObj.hasOwnProperty('xrange')) {
    wrenObj.xrange = 172800000;
  }
  wrenObj.totalPoints = wrenObj.xrange / wrenObj.updateInterval;

  /*
   * if xrange is more than 2.5 days, the xtick format will be YY/mm/dd,
   * otherwise HH:MM:DD.
   */
  if (wrenObj.xrange >= 889032704) {
    /* 2 months */
    wrenObj.xtickFormat = "%m/%d";
    wrenObj.xtickSize = [ 15, "day" ];
  } else if (wrenObj.xrange >= 216000000) {
    /* 2.5 days */
    wrenObj.xtickFormat = "%H:%M";
    wrenObj.xtickSize = [ 12, "hour" ];
  } else if (wrenObj.xrange >= 86400000) {
    /* 1 day */
    wrenObj.xtickFormat = "%H:%M";
    wrenObj.xtickSize = [ 6, "hour" ];
  } else if (wrenObj.xrange >= 43200000) {
    /* 12 hours */
    wrenObj.xtickFormat = "%H:%M";
    wrenObj.xtickSize = [ 1, "hour" ];
  } else if (wrenObj.xrange >= 3600000) {
    /* 1 hour */
    wrenObj.xtickFormat = "%H:%M";
    wrenObj.xtickSize = [ 15, "minute" ];
  } else {
    wrenObj.xtickFormat = "%H:%M:%S";
    wrenObj.xtickSize = [ wrenObj.xrange / 1000 / 5, "second" ];
  }

  wrenObj.flotXAxisBase = {
    mode: "time",
    timezone: "browser",
    tickSize: wrenObj.xtickSize,
    timeformat: wrenObj.xtickFormat,
  //  tickFormatter: tick_x_format,
  //  minTickSize: [ 20, "second" ],
    axisLabel: "Time",
    axisLabelUseCanvas: true,
    axisLabelFontSizePixels: 10,
    axisLabelFontFamily: 'Verdana, Arial',
    axisLabelPadding: 10
  };

  wrenObj.flotSeriesBase = {
    lines: {
      lineWidth: 1.2
    },
    bars: {
      align: "center",
      fillColor: { colors: [{ opacity: 0.4 }, { opacity: 0.4 }] },
      barWidth: 500,
      lineWidth: 1
    }
  };

  wrenObj.flotLegendBase = {
    noColumns: 0,
    position:"nw"
  };

  wrenObj.flotGridBase = {      
    backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
  };

  wrenObj.errorbarPointStyle = {
    radius: 0,
    errorbars: "y",
    yerr: {
      show:true,
      asymmetric:true,
      upperCap:"-",
      lowerCap:"-",
      radius:5
    } };
}

function dataset_init()
{
  /* clear the dataset */
  for (var i = 0; i < wrenObj.dataDef.length; i++) {
    _wrenDataSet[i] = [];
  }
  wrenObj.firstRetrieve = true;
}

function tick_x_format(v, axis) {
  var date = new Date(v);
  if (date.getSeconds() % xxx == 0) {
    var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
  } else {
    return "";
  }
}

/*
 * @param member a list of indexes, e.g. [ 1, 2 ]
 */
function get_float_axes(member) {
  var v_yaxes = [];
  for (var i = 0; i < member.length; i++) {
    var idx = member[i];
    var d = {
      min: wrenObj.dataDef[idx].min,
      max: wrenObj.dataDef[idx].max,
      tickSize:wrenObj.dataDef[idx].ytick,
      axisLabel: wrenObj.dataDef[idx].unit,
      axisLabelUseCanvas: true,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Verdana, Arial',
      axisLabelPadding: 6
    };
    if (wrenObj.dataDef[idx].yaxis == 2)
      d["position"] = "right";
    v_yaxes.push(d);
  }
  return {
    series: wrenObj.flotSeriesBase,
    xaxis: wrenObj.flotXAxisBase,
    yaxes: v_yaxes,
    legend: wrenObj.flotLegendBase,
    grid: wrenObj.flotGridBase,
  };
}

/*
 * @param member a list of indexes, e.g. [ 1, 2 ]
 */
function update_flot_data(member) {
  var ret = [];
  for (var i = 0; i < member.length; i++) {
    var idx = member[i];
//console.log(_wrenDataSet[idx]);
    var dataset = {
      label: wrenObj.dataDef[idx].label + ": " + _wrenDataSet[idx][0][1] + " " + wrenObj.dataDef[idx].unit,
      data: _wrenDataSet[idx],
      lines: { show: true, fill: false, lineWidth: 1.2 },
      color: wrenObj.dataDef[idx].color,
      //clickable: "true",
      //hoverable: "true",
    };
    if (wrenObj.dataDef[idx].yaxis == 2)
      dataset['yaxis'] = 2;
    if (_wrenDataSet[idx][0].length == 4)
      dataset['points'] = wrenObj.errorbarPointStyle;
    ret.push(dataset);
  }
  return ret;
}

/*
 * flotDef: defines a combination of dataDefs.
 *   = [ {
 *         flot: <canvas id>,
 *         set: [ <# of list of dataDefs> ]
 *       }, {...} ]
 */
function update_canvas()
{
  for (var i = 0; i < wrenObj.flotDef.length; i++) {
    var canvas = wrenObj.flotDef[i].flot;
    var dataset = update_flot_data(wrenObj.flotDef[i].set);
    var opt = get_float_axes(wrenObj.flotDef[i].set);
    $.plot($(canvas), dataset, opt);
  }
}

/*
 * dataDef: defines a set of parameter for a single line or points.
 *   = [ {
 *         key: [ <list of keys> ],
 *         label: "<label>",
 *         unit: "<unit>",
 *         color: "<color>",
 *         min: <number>,
 *         max: <number>,
 *         ytick: <number>,
 *         yaxis: <option: 2>
 *     }, {...} ]
 */

/*
 * update the dataset, _wrenDataSet.
 * @param res a list of points in json.
 * @param i index of the target in dataDef.
 * XXX this function needs to be reviewd..
 */
function wren_update_dataset(res, i, remove_head)
{
  var kvt = [];
  for (let j = 0; j < wrenObj.dataDef[i].key.length; j++) {
    kvt[j] = res[wrenObj.dataDef[i].key[j]];
  }
  if (kvt[0] == undefined) {
    return;
  }
  for (let k = 0; k < kvt[0].length; k++) {
    let d = kvt[0][k];
    if (d[0] == 0) {
      // ignore it if ts is zero.
      continue;
    }
    if (remove_head == true) {
      _wrenDataSet[i].pop(); // remove the oldest recoard.
    }
    if (wrenObj.dataDef[i].key.length > 1) {
      /*
       * assuming it's an errorbar chart.
       */
      var y = kvt[0][k][1];
      var found = false;
//console.log('#of res', wrenObj.dataDef[i].key.length);
      for (var j = 1; j < wrenObj.dataDef[i].key.length; j++) {
        for (var q = 0; q < kvt[j].length; q++) {
          if (kvt[j][q][0] == kvt[0][k][0]) {
            found = true;
            z = kvt[j][q][1];
            if (z > y)
              z -= y;
            else
              z = y - z;
            d.push(z);
            break;
          }
        }
        if (wrenObj.dataDef[i].key.length > 1 && found == false) {
          console.log('ERROR: no suitable value for', wrenObj.dataDef[i].key[0], kvt[0][k][0]);
        }
      }
    }
    _wrenDataSet[i].unshift(d);
  }
}

function fill_dataset(i)
{
//console.log('before filled: _wrenDataSet', i, _wrenDataSet[i]);
//console.log('  length', _wrenDataSet[i].length);
  let x;
  if (_wrenDataSet[i].length == 0) {
    x = 0;
  } else {
    x = _wrenDataSet[i][_wrenDataSet[i].length - 1][0];
  }
  var jmax = wrenObj.totalPoints - _wrenDataSet[i].length;
  for (var j = 0; j < jmax; j++) {
    var d = [x -= wrenObj.updateInterval];
    for (var k = 0; k < wrenObj.dataDef[i].key.length; k++) {
      d.push(0);
    }
    _wrenDataSet[i].push(d);
  }
//console.log('filled _wrenDataSet[i].length', _wrenDataSet[i].length);
}

/*
 * send a query.
 */
function send_query()
{
  /* call the proper function for query. */
  var q = wrenObj.query.update_query(wrenObj);
  $.ajax({
    url: q.server_url,
    type: wrenObj.query.type,
    cache: false,
    headers: wrenObj.query.headers,
    dataType: wrenObj.query.dataType,
    scriptCharset: wrenObj.query.scriptCharset,
    data: q.query_data,
    success: wrenObj.query.cb_recv_response,
  })
  .fail(function(xhr, status, err) { cb_query_error(xhr, status, err); });
}

function set_timeout()
{
  _wrenEvTimeout = setTimeout(send_query, wrenObj.updateInterval);
}

function cb_query_error(xhr, st, err)
{
  clearTimeout(_wrenEvTimeout);
  // XXX it should be done according to the error code from the server.
  var m = "ERROR:";
  console.log('DEBUG: query_error: xhr [', xhr, ']')
  console.log('DEBUG: query_error: st  [', st, ']')
  console.log('DEBUG: query_error: err [', err, ']')
  if (/failed to connect/i.test(err)) {
    m += "connection failed to the server.";
  } else {
    //if (xhr.responseText)
    //  m += "[XMLHttpRequest: " + xhr.responseText + "]";
    if (st)
      m += "[textStatus: " + st + "]";
    if (err.message)
        "[errorThrown: " + err.message + "]";
  }
  if (document.hasOwnProperty('inputRetry') && document.getElementById('inputRetry').checked == true) {
    print_log(m, true);
    set_timeout();
  } else {
    /* abort */
    fatal_error(m);
  }
}

/*
 * dispatcher of the functions to process the response.
 */
function cb_recv_response(res)
{
  clearTimeout(_wrenEvTimeout);
  document.getElementById('divConsole').innerHTML = null;
  /* once it gets multiple data, it will get one data from next time. */
  if (wrenObj.firstRetrieve == true) {
    wrenObj.firstRetrieve = false;
    parse_response_at_once(res);
  }
  else {
    parse_response(res);
  }
  // XXX should it be done here ?
  query_clear_state(wrenObj);
}

/*
 * it deals with one record.
 * callback function to parse the response.
 * update the data set and canvas.
 */
function parse_response(res)
{
  /* parse the response */
  res = wren_obj_canonicalize(res, wrenObj.tzOffset);
  for (var i = 0; i < wrenObj.dataDef.length; i++) {
    wren_update_dataset(res, i, true);
  }
  update_canvas();
  set_timeout();
}

/*
 * it deals with all records in the duratoin.
 * callback function to parse the response at once.
 * update the data set and canvas.
 */
function parse_response_at_once(res)
{
  /* parse the response */
  res = wren_obj_canonicalize(res, wrenObj.tzOffset);
  for (var i = 0; i < wrenObj.dataDef.length; i++) {
    wren_update_dataset(res, i, false);
    fill_dataset(i);
  }
  update_canvas();
  set_timeout();
}

/********
 *
 * callback for events.
 */

function ev_click_start()
{
  clearTimeout(_wrenEvTimeout);
  if (document.hasOwnProperty('inputRefresh') && (document.getElementById('inputRefresh').checked == true)) {
    dataset_init();
  }
  send_query();
}

function ev_click_stop()
{
  clearTimeout(_wrenEvTimeout);
}

/* this function may be overrided. */
function ev_init_local()
{
  /* dummy */
}

function ev_init()
{
  if (wrenObj.autostart) {
    ev_click_start()
  } else {
    if (document.hasOwnProperty('btnStop')) {
      document.getElementById('btnStop').addEventListener('click', ev_click_stop, false);
    }
    if (document.hasOwnProperty('btnStart')) {
      document.getElementById('btnStart').addEventListener('click', ev_click_start, false);
    }
  }

  /* it's for localization */
  ev_init_local()
}

$(document).ready(function() {
  wren_init();
  dataset_init();
  ev_init();
});
