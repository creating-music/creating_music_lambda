const AWS = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');

const s3 = new S3({ signatureVersion: 'v4', region: 'ap-northeast-2' });

const bucketName = 'monotest-bucket';

exports.handler = async (event) => {
  const { fileName } = event;

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
