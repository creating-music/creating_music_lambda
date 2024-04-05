const AWS = require('aws-sdk');
const S3 = require('aws-sdk/clients/s3');

const s3 = new S3();

const bucketName = 'monotest-bucket';
const objectList = [];

const main = async () => {
  await s3
    .listBuckets()
    .promise()
    .then((data) => {
      console.log(`S3: ${JSON.stringify(data, null, 2)}`);
    });

  await s3
    .listObjectsV2({ Bucket: bucketName })
    .promise()
    .then((data) => {
      console.log(`Object Lists: `, data);

      data.Contents.forEach((item) => {
        objectList.push(item.Key);
      });

      console.log(objectList);
    });
};

main();
