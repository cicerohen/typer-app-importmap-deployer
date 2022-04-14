module.exports = {
    urlSafeList: process.env.SAFE_URL ? process.env.SAFE_URL.split(' '): [],
    username: process.env.HTTP_USERNAME,
    password: process.env.HTTP_PASSWORD,
    region: process.env.AWS_DEFAULT_REGION || "us-east-2",
    s3: {
      putObject: {
        ACL: process.env.AWS_CANNED_ACL || "public-read",
      },
    },
    manifestFormat: "importmap",
    locations: {
      prod: process.env.PRODUCTION_S3_OBJECT_URL,
    },
    cacheControl: "no-store"
  };