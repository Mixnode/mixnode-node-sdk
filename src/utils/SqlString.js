const SqlString = exports;

const ID_GLOBAL_REGEXP = /"/g;
const QUAL_GLOBAL_REGEXP = /\./g;
const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\'\\]/g; // eslint-disable-line no-control-regex
const CHARS_ESCAPE_MAP = {
  '\0': '\\0',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
  '\'': '\\\'',
  '\\': '\\\\'
};

SqlString.escapeId = function escapeId(val, forbidQualified) {
  if (Array.isArray(val)) {
    let sql = '';

    for (let i = 0; i < val.length; i++) {
      sql += (i === 0 ? '' : ', ') + SqlString.escapeId(val[i], forbidQualified);
    }

    return sql;
  } if (forbidQualified) {
    return `"${String(val).replace(ID_GLOBAL_REGEXP, '""')}"`;
  }
    return `"${String(val).replace(ID_GLOBAL_REGEXP, '""').replace(QUAL_GLOBAL_REGEXP, '"."')}"`;
};

SqlString.escape = function escape(val, stringifyObjects, timeZone) {
  if (val === undefined || val === null) {
    return 'NULL';
  }

  switch (typeof val) {
    case 'boolean': return (val) ? 'true' : 'false';
    case 'number': return `${val}`;
    case 'object':
      if (val instanceof Date) {
        return SqlString.dateToString(val, timeZone || 'local');
      } if (Array.isArray(val)) {
        return SqlString.arrayToList(val, timeZone);
      } if (Buffer.isBuffer(val)) {
        return SqlString.bufferToString(val);
      } if (typeof val.toSqlString === 'function') {
        return String(val.toSqlString());
      } if (stringifyObjects) {
        return escapeString(val.toString());
      }
        return SqlString.objectToValues(val, timeZone);

    default: return escapeString(val);
  }
};

SqlString.arrayToList = function arrayToList(array, timeZone) {
  let sql = '';

  for (let i = 0; i < array.length; i++) {
    const val = array[i];

    if (Array.isArray(val)) {
      sql += `${i === 0 ? '' : ', '}(${SqlString.arrayToList(val, timeZone)})`;
    } else {
      sql += (i === 0 ? '' : ', ') + SqlString.escape(val, true, timeZone);
    }
  }

  return sql;
};

SqlString.format = function format(sql, values, stringifyObjects, timeZone) {
  if (values == null) {
    return sql;
  }

  if (!(values instanceof Array || Array.isArray(values))) {
    values = [values];
  }

  let chunkIndex = 0;
  const placeholdersRegex = /\?+/g;
  let result = '';
  let valuesIndex = 0;
  let match;

  while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
    const len = match[0].length;

    if (len > 2) {
      continue;
    }

    const value = len === 2
      ? SqlString.escapeId(values[valuesIndex])
      : SqlString.escape(values[valuesIndex], stringifyObjects, timeZone);

    result += sql.slice(chunkIndex, match.index) + value;
    chunkIndex = placeholdersRegex.lastIndex;
    valuesIndex++;
  }

  if (chunkIndex === 0) {
    // Nothing was replaced
    return sql;
  }

  if (chunkIndex < sql.length) {
    return result + sql.slice(chunkIndex);
  }

  return result;
};

SqlString.dateToString = function dateToString(date, timeZone) {
  const dt = new Date(date);

  if (isNaN(dt.getTime())) {
    return 'NULL';
  }

  let year;
  let month;
  let day;
  let hour;
  let minute;
  let second;
  let millisecond;

  if (timeZone === 'local') {
    year = dt.getFullYear();
    month = dt.getMonth() + 1;
    day = dt.getDate();
    hour = dt.getHours();
    minute = dt.getMinutes();
    second = dt.getSeconds();
    millisecond = dt.getMilliseconds();
  } else {
    const tz = convertTimezone(timeZone);

    if (tz !== false && tz !== 0) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }

    year = dt.getUTCFullYear();
    month = dt.getUTCMonth() + 1;
    day = dt.getUTCDate();
    hour = dt.getUTCHours();
    minute = dt.getUTCMinutes();
    second = dt.getUTCSeconds();
    millisecond = dt.getUTCMilliseconds();
  }

  // YYYY-MM-DD HH:mm:ss.mmm
  const str = `${zeroPad(year, 4)}-${zeroPad(month, 2)}-${zeroPad(day, 2)} ${
    zeroPad(hour, 2)}:${zeroPad(minute, 2)}:${zeroPad(second, 2)}.${
    zeroPad(millisecond, 3)}`;

  return escapeString(str);
};

SqlString.bufferToString = function bufferToString(buffer) {
  return `X${escapeString(buffer.toString('hex'))}`;
};

SqlString.objectToValues = function objectToValues(object, timeZone) {
  let sql = '';

  for (const key in object) {
    const val = object[key];

    if (typeof val === 'function') {
      continue;
    }

    sql += `${(sql.length === 0 ? '' : ', ') + SqlString.escapeId(key)} = ${SqlString.escape(val, true, timeZone)}`;
  }

  return sql;
};

SqlString.raw = function raw(sql) {
  if (typeof sql !== 'string') {
    throw new TypeError('argument sql must be a string');
  }

  return {
    toSqlString: function toSqlString() { return sql; }
  };
};

function escapeString(val) {
  let chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
  let escapedVal = '';
  let match;

  while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
    chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
  }

  if (chunkIndex === 0) {
    // Nothing was escaped
    return `'${val}'`;
  }

  if (chunkIndex < val.length) {
    return `'${escapedVal}${val.slice(chunkIndex)}'`;
  }

  return `'${escapedVal}'`;
}

function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = `0${number}`;
  }

  return number;
}

function convertTimezone(tz) {
  if (tz === 'Z') {
    return 0;
  }

  const m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
  }
  return false;
}
