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
  if (!obj.hasOwnProperty('query'))
      obj.query = {}

  /* set query attributes */
  if (obj.query.hasOwnProperty('serverURL') || obj.query.serverURL) {
    obj.query.baseURI = obj.query.serverURL;
    if (obj.query.baseURI[obj.query.baseURI.length - 1] != '/') {
      obj.query.baseURI += "/";
    }
    obj.query.baseURI += "?";
  } else {
    obj.query.baseURI = "/?";
  }
  obj.query.type = 'GET';
  obj.query.scriptCharset = 'utf-8';
  obj.query.dataType = '';
  obj.query.headers = {};
  obj.query.update_query = kiwi_update_query;
  obj.query.cb_query_error = cb_query_error;
}

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function kiwi_update_query(obj)
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
  return { 'server_url': obj.query.baseURI + server_url, 'query_data': "" };
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
  if (!obj.hasOwnProperty('query'))
      obj.query = {}

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
}

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function kii_update_query(obj)
{
  var date = new Date();
  /* query time */
  var qtime;
  if (obj.queryTime)
    qtime = obj.queryTime;
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
  var query_data = {
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
    query_data["bestEffortLimit"] = obj.query.limit;
  }

  return { 'server_url': obj.query.baseURI,
    'query_data': JSON.stringify(query_data) };
}
