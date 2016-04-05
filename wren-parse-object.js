/*
// begin of debug code

console.log('--- prepare ---');
var obj = require('./' + process.argv[2]);
console.log(obj);
console.log('--- start ---');
var pset = wren_obj_serialize(obj, 0);
var target = 'http://fiap.tanu.org/test/alps/f1/temperature/min';
console.log('--- end ---');
console.log(pset[target]);

// end of debug code
*/

/*
 * convert the time into a milliseconds number.
 * convert the value into a float number.
 * sort by data chronologically (new -> old).
 * @param obj a list of points with a list of tv each in json.
 *         i.e. { p1:[[t1,v1],[t2,v2]], p2:... }
 * @return a list of points in json.
 */
function wren_obj_canonicalize(obj, tz)
{
//console.log('=== start canonicalize ===');
  for (var i in obj) {
    for (var j in obj[i]) {
      obj[i][j] = [ new Date(obj[i][j].time).getTime() + tz,
        parseFloat(obj[i][j].value) ];
    }
    obj[i].sort(function(a, b) { return a[0] - b[0] });
  }
//console.log(obj);
//console.log('=== end canonicalize ===');
  return obj;
}

/*
 * it converts a single tv object into a list of tv if it is not a list.
 * it produces a new object encoding the list in json.
 * @param obj a list of points.
 * @return a list of points. i.e. {'k1':[{t1,v2},{t2,v2},...],'k2':...}
 */
function wren_fiap_obj_serialize(obj)
{
//console.log('=== start serialize fiap ===');
  var dst = {};
  for (var i in obj) {
    if (dst.hasOwnProperty(i)) {
      dst[i].push(obj[i]);
    } else {
      if (obj[i].length == undefined) {
        dst[i] = [ obj[i] ];
      } else {
        dst[i] = obj[i];
      }
    }
  }
//console.log(dst);
//console.log('=== end serialize fiap ===');
  return dst;
}

/*
 * kii cloud returns [ {'k1':{t1,v1},'k2':{t1,v2},...},{'k1':{t2,v2},...},... ]
 * it converts a list of kii objects or a kii object into a list of points.
 * it produces a new object encoding the list in json.
 * @param obj a list of kii objects.
 * @return a list of points. i.e. {'k1':[{t1,v2},{t2,v2},...],'k2':...}
 */
function wren_kii_obj_serialize(obj)
{
//console.log('=== start serialize kii ===');
  var dst = {}
  if (obj.kii) {
    if (!obj.kii.point) {
      return undefined;
    }
    for (var i in obj.kii.point) {
      if (dst.hasOwnProperty(i)) {
        dst[i].push(obj.kii.point[i]);
      } else {
        if (obj.kii.point[i].length == undefined) {
          dst[i] = [ obj.kii.point[i] ];
        } else {
          dst[i] = obj.kii.point[i];
        }
      }
    }
  } else if (obj.length && obj[0].kii) {
    /*
     * this is probably a list of points encoded in kii object
     * if the first object has the kii object.
     */
    for (var i in obj) {
      if (!obj[i].kii.point) {
        return undefined;
      }
      for (var j in obj[i].kii.point) {
        if (dst.hasOwnProperty(j)) {
          dst[j].push(obj[i].kii.point[j]);
        } else {
          if (obj[i].kii.point[j].length == undefined) {
            dst[j] = [ obj[i].kii.point[j] ];
          } else {
            dst[j] = obj[i].kii.point[j];
          }
        }
      }
    }
  }
//console.log(dst);
//console.log('=== end serialize kii ===');
  return dst;
}

/*
 * with calling a sub function, it serializes the data passed by a server.
 * the sub function produces a new object for the serialization.
 * at the end, it calls the sub function to canonicalize the new object.
 * @param obj a data passed by a server.
 * @param tz timezone offset in milliseconds.
 * @return a set of points in json if succeeded, otherwise return undefinde.
 */
function wren_obj_serialize(obj, tz)
{
  var pset;
  if (obj.hasOwnProperty('kiwi')) {
    if (!obj.kiwi.hasOwnProperty('point')) {
      console.log('ERROR: there is no suitable point object in kiwi object.');
      return undefined;
    }
    pset = wren_fiap_obj_serialize(obj.kiwi.point);
  } else if (obj.hasOwnProperty('fiap')) {
    if (!obj.fiap.hasOwnProperty('queryRS') ||
        !obj.fiap.queryRS.hasOwnProperty('point')) {
      console.log('ERROR: there is no suitable point object in fiap object.');
      return undefined;
    }
    pset = wren_fiap_obj_serialize(obj.fiap.queryRS.point);
  } else if (obj.hasOwnProperty('queryDescription') && obj.hasOwnProperty('results')) {
    if (obj.results.hasOwnProperty('kii') ||
      (obj.results.length && obj.results[0].hasOwnProperty('kii'))) {
      pset = wren_kii_obj_serialize(obj.results);
      if (!pset) {
        console.log('ERROR: there is no suitable point object in kii object.');
        return undefined;
      }
    }
  } else {
    console.log('ERROR: unsupported object.');
    return undefined;
  }
  return wren_obj_canonicalize(pset, tz);
}
