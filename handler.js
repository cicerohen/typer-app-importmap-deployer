"use strict";

const { S3Client, GetObjectCommand, PutObjectCommand  } = require("@aws-sdk/client-s3");
const ReadWriteLock = require('rwlock');

const lock = new ReadWriteLock();

const S3 = new S3Client({ region: process.env.REGION });

const getEmptyManifest = () => ({
  imports: {},
  scopes: {}
})

const getObject = (stage) => {
  return S3.send(new GetObjectCommand({
    Bucket: `${process.env.BUCKET_NAME}`,
    Key: `importmap-${stage}.json`
  }))
};

const putObject =  (manifest = {}, stage) => {
  return S3.send(new PutObjectCommand({
    Bucket: `${process.env.BUCKET_NAME}`,
    Key: `importmap-${stage}.json`,
    Body: JSON.stringify(manifest),
    ContentType: "application/importmap+json",
  }));
};

const getManifest = (stage) => new Promise((resolve) => {
  getObject(stage)
    .then((response) => {
      return response.Body.transformToString()
    })
    .then((body) => resolve(body))
    .catch((error) => {
      if(error.Code === "NoSuchKey") {
        putObject(getEmptyManifest(), stage)
        .then(() => getObject(stage))
        .then((response) => response.Body.transformToString())
        .then((body) => resolve(body))
        .catch(() => {
          resolve()
        })
      } else {
        resolve()
      }
    })
})

const modifyManifest = (service, url, stage) =>  new Promise((resolve, reject) => {
  lock.writeLock((release) => {
    getManifest(stage)
    .then((manifest) => {
      const manifestCopy = manifest && JSON.parse(manifest) || getEmptyManifest();
      manifestCopy.imports[service] = url;
      return putObject(manifestCopy, stage);
    })
    .then(() => {
      release();
      resolve();
    })
    .catch((error) => {
      release()
      reject(error)
    })
  })
});

module.exports.services = async (event) => {
    const { service, url, stage } = JSON.parse(event.body || "{}");
    await modifyManifest(service, url, stage);
    
    return {
      statusCode: 201
    }
  
};
  