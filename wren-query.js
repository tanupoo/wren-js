/*
 * Copyright (C) 2010 Shoichi Sakane <sakane@tanu.org>, All rights reserved.
 * See the file LICENSE in the top level directory for more details.
 */

/*****
 * for kiwi server.
 */

/*
 * check and initializing the kiwi object.
 * @param obj wrenObj
 */
function kiwi_init(obj)
{
  /* check required attributes */
  if (!obj.hasOwnProperty('kiwi')) {
    console.log("ERROR: wrenObj.kiwi is not defined.");
  }
  /* set query_function */
  obj.query_function = kiwi_send_query;
  /* set baseURI */
  if (obj.kiwi.hasOwnProperty('serverURL') || obj.kiwi.serverURL) {
    obj.baseURI = obj.kiwi.serverURL;
    if (obj.baseURI[obj.baseURI.length - 1] != '/') {
      obj.baseURI += "/";
    }
    obj.baseURI += "?";
  } else {
    obj.baseURI = "/?";
  }
}

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function update_query_kiwi(obj)
{
  var server_url = "";
  for (var i = 0; i < obj.dataDef.length; i++) {
    if (obj.dataDef[i].key.length) {
      for (var j = 0; j < obj.dataDef[i].key.length; j++) {
        server_url += server_url ? "&" : "";
        server_url += "k=" + obj.dataDef[i].key[j];
      }
    } else {
      server_url += server_url ? "&" : "";
      server_url += "k=" + obj.dataDef[i].key;
    }
  }
  return { 'server_url': obj.baseURI + server_url, 'query_data': "" };
}

/*
 * sending a query to the kiwi server.
 * @param obj wrenObj
 * @param cb callback if succeeded.
 * @param cb_error callback if failed.
 */
function kiwi_send_query(obj, cb, cb_error)
{
  s = update_query_kiwi(obj);
  $.ajaxSetup({ cache: false });
  $.ajax({
    url: s.server_url,
    success: cb,
    error: cb_error
  });
}

/*****
 * for fiap server.
 */

/*
 * check and initializing the fiap object.
 * @param obj wrenObj
 */
function fiap_init(obj)
{
  /* check required attributes */
  if (!obj.hasOwnProperty('fiap')) {
    alert("ERROR: wrenObj.fiap is not defined.");
  }
  /* set query_function */
  obj.query_function = send_query_fiap;
  /* set baseURI */
  if (!obj.fiap.hasOwnProperty('serverURL') || obj.fiap.serverURL) {
    obj.baseURI = obj.fiap.serverURL;
    if (obj.fiap.serverURL[obj.fiap.serverURL.length - 1] != '/') {
      obj.baseURI += "/";
    }
    obj.baseURI += "?";
  } else {
    obj.baseURI = "/?";
  }
}

/*
 * sending a query to the fiap server with JSON binding.
 * @param obj wrenObj
 * @param cb callback if succeeded.
 * @param cb_error callback if failed.
 */
function send_query_fiap(obj, cb, cb_error)
{
  alert("FATAL: send_query_fiap() is not supported yet.");
  //s = update_query_fiap(obj);
  $.ajaxSetup({ cache: false });
  $.ajax({
    url: s.server_url,
    type: 'POST',
    headers: {
      'X-HTTP-Method-Override': 'POST',
      'Content-Type': 'text/json'
    },
    dataType: 'json',
    scriptCharset: 'utf-8',
    data: s.query_data,
    success: cb,
    error: cb_error
  });
}

/*****
 * for KiiCloud.
 */

/*
 * check and initializing the kii object.
 * @param obj wrenObj
 */
function kii_init(obj)
{
  /* check required attributes */
  if (!obj.hasOwnProperty('kii')) {
    console.log("ERROR: wrenObj.kii is not defined.");
  }
  var attr = ['serverURL', 'app_id', 'app_key', 'thing_id', 'thing_token',
      'bucket_id'];
  for (var a in attr) { 
    if (!obj.kii.hasOwnProperty(a) || !obj.kii['a']) {
      console.log("ERROR: wrenObj.kii.%s is not defined, or null.", a);
    }
  }
  /* set query_function */
  obj.query_function = send_query_kii;
  /* set baseURI */
  obj.baseURI = obj.kii.serverURL + "/" + obj.kii.app_id + "/things/" +
      obj.kii.thing_id + "/buckets/" + obj.kii.bucket_id + "/query";
}

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function update_query_kii(obj)
{
  var date = new Date();
  var unixtime = date.getTime();
  var delta;
  if (obj.firstRetrieve == true) {
    delta = obj.xrange;
  } else {
    delta = obj.updateInterval * 2;
  }
  var query_data = {
    "bucketQuery": {
      "clause": {
        "type": "range",
        "field": "kii.produced",
        "lowerLimit": unixtime - delta,
        "lowerIncluded": true,
        "upperLimit": unixtime,
        "upperIncluded": true
      }
    }
  };
  if (obj.kii.hasOwnProperty('limit')) {
    query_data["bestEffortLimit"] = obj.kii.limit;
  }

  return { 'server_url': obj.baseURI, 'query_data': JSON.stringify(query_data) };
}

/*
 * sending a query to the KiiCloud.
 * @param obj wrenObj
 * @param cb callback if succeeded.
 * @param cb_error callback if failed.
 */
function send_query_kii(obj, cb, cb_error)
{
  s = update_query_kii(obj);
  $.ajaxSetup({ cache: false });
  $.ajax({
    url: s.server_url,
    type: 'POST',
    headers: {
      'X-HTTP-Method-Override': 'POST',
      'Content-Type': 'application/vnd.kii.QueryRequest+json',
      'X-Kii-AppID': obj.kii.app_id,
      'X-Kii-AppKey': obj.kii.app_key,
      'Authorization': 'Bearer ' + obj.kii.thing_token,
    },
    dataType: 'json',
    scriptCharset: 'utf-8',
    data: s.query_data,
    success: cb,
    error: cb_error
  });
}

