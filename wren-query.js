/*
 * Copyright (C) 2010 Shoichi Sakane <sakane@tanu.org>, All rights reserved.
 * See the file LICENSE in the top level directory for more details.
 */

/*
 * result:
 *   stores the total result from the server.
 * lastQuery:
 *   stores the last query string.
 * lastCursor:
 *   stores the cursor at the response of the last query.
 * queryTime:
 *   time string for query, which is passed from the browser typically.
 */

function query_init_common(obj)
{
  /* check required attributes */
  if (!obj.hasOwnProperty('query'))
    obj.query = {};

  /* initialize common attributes */
  query_clear_state(obj);
}

function query_clear_state(obj)
{
  obj.query.result = [];
  obj.query.lastQuery = {};
  obj.query.lastCursor = '';
  obj.query.queryTime = 0;
}

/*****
 * for kiwi server.
 */

/*
 * check and initializing the kiwi object.
 * @param obj wrenObj
 */
function kiwi_init(obj)
{
  query_init_common(obj);

  /* set query attributes */
  if (!obj.query.hasOwnProperty('serverQueryURL')) {
    if (obj.query.hasOwnProperty('serverURL') || obj.query.serverURL) {
      obj.query.baseURI = obj.query.serverURL;
      if (obj.query.baseURI[obj.query.baseURI.length - 1] != '/') {
        obj.query.baseURI += "/";
      }
      obj.query.baseURI += "?";
    } else {
      obj.query.baseURI = "/?";
    }
  }
  obj.query.type = 'GET';
  obj.query.scriptCharset = 'utf-8';
  obj.query.dataType = '';
  obj.query.headers = {};
  obj.query.update_query = kiwi_update_query;
  obj.query.cb_recv_response = kiwi_cb_recv_response;
}

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function kiwi_update_query(obj)
{
  if (!obj.query.hasOwnProperty('serverQueryURL')) {
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
    return { 'server_url': obj.query.baseURI + server_url, 'query_data': "" };
  } else {
    return { 'server_url': obj.query.serverQueryURL, 'query_data': "" };
  }
}

function kiwi_cb_recv_response(res)
{
  if (!res.hasOwnProperty('kiwi') ||
      !res.kiwi.hasOwnProperty('point')) {
    console.log('ERROR: there is no suitable point object in kiwi object.');
    return;
  }
  var pset = wren_fiap_obj_serialize(res.kiwi.point);
  if (!pset) {
    console.log('ERROR: serialization of the kiwi (fiap) object failed.');
    return;
  }
  cb_recv_response(pset);
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
  query_init_common(obj);

  /* set query attributes */
  if (!obj.query.hasOwnProperty('serverURL') || obj.query.serverURL) {
    obj.query.baseURI = obj.query.serverURL;
    if (obj.query.serverURL[obj.query.serverURL.length - 1] != '/') {
      obj.query.baseURI += "/";
    }
    obj.query.baseURI += "?";
  } else {
    obj.query.baseURI = "/?";
  }
  obj.query.type = 'GET';
  obj.query.scriptCharset = 'utf-8';
  obj.query.dataType = 'json';
  obj.query.headers = {
      'Content-Type': 'text/json'
  };
  obj.query.update_query = fiap_update_query;
  obj.query.cb_recv_response = fiap_cb_recv_response;
}

function fiap_cb_recv_response(res)
{
  /* check the response */
  if (!obj.hasOwnProperty('fiap') ||
      !obj.fiap.hasOwnProperty('queryRS') ||
      !obj.fiap.queryRS.hasOwnProperty('point')) {
    console.log('ERROR: there is no suitable point object in fiap object.');
    return;
  }
  var pset = wren_fiap_obj_serialize(obj.fiap.queryRS.point);
  if (!pset) {
    console.log('ERROR: serialization of the fiap object failed.');
    return;
  }
  // XXX needs to add more process, e.g. cursor.
  cb_recv_response(pset);
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
  query_init_common(obj);

  /* check required attributes */
  if (!obj.hasOwnProperty('query')) {
    console.log("ERROR: wrenObj.query is not defined.");
  }
  var attr = ['serverURL', 'app_id', 'app_key', 'thing_id', 'thing_token',
      'bucket_id'];
  for (var i; i < attr.length; i++) {
    if (!obj.query.hasOwnProperty(attr[i]) || !obj.query[attr[i]]) {
      console.log("ERROR: wrenObj.query.%s is not defined, or null.", attr[i]);
    }
  }
  /* set query attributes */
  obj.query.baseURI = obj.query.serverURL + "/" + obj.query.app_id +
    "/things/" + obj.query.thing_id + "/buckets/" + obj.query.bucket_id +
    "/query";
  obj.query.type = 'POST';
  obj.query.scriptCharset = 'utf-8';
  obj.query.dataType = 'json';
  obj.query.headers = {
    'X-HTTP-Method-Override': 'POST',
    'Content-Type': 'application/vnd.kii.QueryRequest+json',
    'X-Kii-AppID': obj.query.app_id,
    'X-Kii-AppKey': obj.query.app_key,
    'Authorization': 'Bearer ' + obj.query.thing_token,
  };
  obj.query.update_query = kii_update_query;
  obj.query.cb_recv_response = kii_cb_recv_response;
}

function kii_cb_recv_response(res)
{
  /* check the response */
  if (!res.hasOwnProperty('queryDescription') ||
      !res.hasOwnProperty('results')) {
    console.log('ERROR: the response is not suitable for the kii object.');
    return;
  }
  if (!res.results.hasOwnProperty('kii') &&
      !(res.results.length && res.results[0].hasOwnProperty('kii'))) {
    console.log('ERROR: the response does not have suitable response.');
    return;
  }
  /* extend the response */
//  wrenObj.query.result.push(res.results);
//  XXX is there any better way ?
  res.results.forEach(function(i) {wrenObj.query.result.push(i)});
  /* check whether the response will continue or not */
  if (res.hasOwnProperty('nextPaginationKey')) {
    wrenObj.query.lastCursor = res.nextPaginationKey;
    /* try to get the next response */
    send_query();
    return;
  }
  /* finish to fetch the response */
  var pset = wren_kii_obj_serialize(wrenObj.query.result);
  if (!pset) {
    console.log('ERROR: serialization of the kii object failed.');
    return;
  }
  cb_recv_response(pset);
}

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function kii_update_query(obj)
{
  var query_data = {};
  /* if lastCursor is defined, simply add it to the last query */
  if (obj.query.lastCursor) {
    if (!obj.query.lastQuery) {
      console.log('ERROR: there is not last query in the wrenObj.');
      return;
    }
    query_data = obj.query.lastQuery;
    query_data.paginationKey = obj.query.lastCursor;
  }
  else {
    var date = new Date();
    /* query time */
    var qtime;
    if (obj.query.queryTime)
      qtime = obj.query.queryTime;
    else
      qtime = date.getTime();
    /* query time range */
    var delta;
    if (obj.firstRetrieve == true) {
      delta = obj.xrange;
    } else {
      delta = obj.updateInterval * 2;
    }
    /* create a query data */
    query_data = {
      "bucketQuery": {
        "clause": {
          "type": "range",
          "field": "kii.produced",
          "lowerLimit": qtime - delta,
          "lowerIncluded": true,
          "upperLimit": qtime,
          "upperIncluded": true
        }
      }
    };
    if (obj.query.hasOwnProperty('limit')) {
      query_data.bestEffortLimit = obj.query.limit;
    }
  }
  /* save the last query */
  obj.query.lastQuery = query_data;
  obj.lastCursor = null;

  return { 'server_url': obj.query.baseURI,
    'query_data': JSON.stringify(query_data) };
}
