const AWS = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');

const s3 = new S3({ signatureVersion: 'v4', region: 'ap-northeast-2' });

const bucketName = 'monotest-bucket';
const keyName = 'audio_pl.m3u8';

const dirpath = '../assets/music/segments';

const keyValue = fs.createReadStream(
  path.resolve(__dirname, dirpath, `./${keyName}`),
);

const objectParams = {
  Bucket: bucketName,
  Key: `music/${keyName}`,
  Body: keyValue,
  ContentType: `$image/${path.extname(keyName).substring(1)}`,
  ACL: `public-read`,
};

const main = async () => {
  const url = await s3
    .upload(objectParams)
    .promise()
    .then((data) => {
      console.log('upload! : ', data.Location);
    });
  console.log(url);
};
main();
