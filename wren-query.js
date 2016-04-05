
/*
 * for kiwi server.
 */

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function update_query_kiwi(obj)
{
  var server_url;
  if (obj.kiwi.hasOwnProperty(server_url) && obj.kiwi.serverURL) {
    server_url = obj.kiwi.serverURL;
    if (server_url[server_url.length - 1] != '/') {
      server_url += "/";
    }
    server_url += "?";
  } else {
    server_url = "/?";
  }
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
  return { 'server_url': server_url, 'query_data': "" };
}

/*
 * sending a query to the kiwi server.
 * @param obj wrenObj
 * @param cb callback if succeeded.
 * @param cb_error callback if failed.
 */
function send_query_kiwi(obj, cb, cb_error)
{
  s = update_query_kiwi(obj);
  $.ajaxSetup({ cache: false });
  $.ajax({
    url: s.server_url,
    success: cb,
    error: cb_error
  });
}

/*
 * for fiap server.
 */

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

/*
 * for KiiCloud.
 */

/*
 * creating query URL and query data.
 * @param obj wrenObj
 * @return URL and query data.
 */
function update_query_kii(obj)
{
  var server_url = obj.kii.serverURL + "/" + obj.kii.app_id + "/things/" +
      obj.kii.thing_id + "/buckets/" + obj.kii.bucket_id + "/query";

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

  return { 'server_url': server_url, 'query_data': JSON.stringify(query_data) };
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

