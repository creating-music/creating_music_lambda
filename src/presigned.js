const AWS = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');

const s3 = new S3({ signatureVersion: 'v4', region: 'ap-northeast-2' });

const bucketName = 'monotest-bucket';

const objectParamsPresign = {
  Bucket: bucketName,
  Key: `music/audio_pl.m3u8`,
  Expires: 60,
};

const main = async () => {
  const url = await s3.getSignedUrlPromise('getObject', objectParamsPresign);
  console.log(url);
};
main();
