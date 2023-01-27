"use strict";

const { S3Client, GetObjectCommand, PutObjectCommand  } = require("@aws-sdk/client-s3");
const ReadWriteLock = require('rwlock');

const lock = new ReadWriteLock();

const S3 = new S3Client({ region: process.env.REGION });

const getEmptyManifest = () => ({
  imports: {},
  scopes: {}
})

const getObject = () => {
  return S3.send(new GetObjectCommand({
    Bucket: `${process.env.BUCKET_NAME}`,
    Key: `importmap-${process.env.NODE_ENV}.json`
  }))
};

const putObject =  (manifest = {}) => {
  return S3.send(new PutObjectCommand({
    Bucket: `${process.env.BUCKET_NAME}`,
    Key: `importmap-${process.env.NODE_ENV}.json`,
    Body: JSON.stringify(manifest),
    CacheControl: "public, must-revalidate, max-age=0",
    ContentType: "application/importmap+json",
    ACL: "public-read"
  }));
};

const getManifest = () => new Promise((resolve) => {
  getObject()
    .then((response) => {
      return response.Body.transformToString()
    })
    .then((body) => resolve(body))
    .catch((error) => {
      if(error.Code === "NoSuchKey") {
        putObject(getEmptyManifest())
        .then(() => getObject())
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

const modifyManifest = (service, url) =>  new Promise((resolve, reject) => {
  lock.writeLock((release) => {
    getManifest()
    .then((manifest) => {
      const manifestCopy = manifest && JSON.parse(manifest) || getEmptyManifest();
      console.log("manifestCopy", manifestCopy);
      manifestCopy.imports[service] = url;
      return putObject(manifestCopy);
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
    const { service, url } = JSON.parse(event.body || "{}");
    await modifyManifest(service, url);
    
    return {
      statusCode: 201
    }
  
};
  