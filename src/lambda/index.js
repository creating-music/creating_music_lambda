const AWS = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');

const s3 = new S3({ signatureVersion: 'v4', region: 'ap-northeast-2' });

const bucketName = 'monotest-bucket';

const crypto = require('crypto');
const https = require('https');

const config = require('../config.json');

module.exports.handler = async (event) => {
  const { request } = event.Records[0].cf;
  const { uri, querystring } = request;
  const hash = crypto
    .createHash('sha256')
    .update(`${uri}?${querystring}`)
    .digest('hex');

  const getOpt = {
    host: config.redisHost,
    token: config.redisToken,
    key: hash,
  };
  const getRes = await get(getOpt);
  if (getRes.statusCode === 200 && getRes.body.result !== null) {
    return forbiddenResponse; // presigned url used already
  }

  const setOpt = {
    ...getOpt,
    val: 'x',
    expire: 3600, // 1-hour
  };
  const setRes = await set(setOpt);
  if (setRes.statusCode !== 200 || setRes.body.result !== 'OK') {
    return forbiddenResponse; // failed to set usage record to redis
  }

  return request;
};

function get(opt) {
  const { host, token, key } = opt;

  const url = `https://${host}/get/${key}`;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, options);
    req.on('response', (res) => {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        resolve({ statusCode: res.statusCode, body: JSON.parse(chunk) });
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

function set(opt) {
  const { host, token, key, val, expire } = opt;

  const url = `https://${host}/set/${key}/${val}/EX/${expire}`;
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, options);
    req.on('response', (res) => {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        resolve({ statusCode: res.statusCode, body: JSON.parse(chunk) });
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

const forbiddenResponse = {
  status: '403',
  statusDescription: 'Forbidden',
  headers: {
    'content-type': [
      {
        key: 'Content-Type',
        value: 'text/plain',
      },
    ],
    'content-encoding': [
      {
        key: 'Content-Encoding',
        value: 'UTF-8',
      },
    ],
  },
  body: 'Forbidden',
};

const getSignedUrl = async (fileName) => {
  const objectParamsPresign = {
    Bucket: bucketName,
    Key: `music/${fileName}`,
    Expires: 60,
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', objectParamsPresign);
    return url;
  } catch (error) {
    console.error(error);
  }
  return '';
};

// exports.handler = async (event) => {
//   const { fileName } = event;

//   return await getSignedUrl(fileName);
// };
