/**
 * AWS Module: Action: Modularized Code
 */

var AWS = require('aws-sdk'),
    keyUtil = require('../upload_key').UploadKey(process.env.HASH_SECRET);

// Export For Lambda Handler
module.exports.run = function(event, context, cb) {
    if (!keyUtil.isValidKey(event.key)) {
        cb("403: Invalid Upload Key: "+event.key, null);
        return;
    }

  var credential = new AWS.Credentials(process.env.UPLOAD_API_KEY, process.env.UPLOAD_API_SECRET, null);
  AWS.config.credentials = credential;
  var sts = new AWS.STS();
  sts.getSessionToken({DurationSeconds: 900}, function(err, data) {
      if (data) {
          cb(null, {
              cred: data.Credentials,
              bucketName: process.env.BUCKET_NAME,
              bucketRegion: process.env.BUCKET_REGION
          });
      } else {
          cb("500: " + err, null);
      }
  });
};

