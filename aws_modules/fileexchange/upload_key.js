/**
 * Created by k_morishita on 2015/10/25.
 */

var sha256 = require("sha256");

var UploadKey = function(secret) {
    var that = {};

    that.createUploadKey = function(name, expire) {
        var expireStr = expire.getFullYear() +"-"+ (expire.getMonth()+1) + "-" + expire.getDate();
        return name + '.' + expireStr + '.' + that.createHash(name + expireStr);
    };

    that.createHash = function(val) {
        return sha256(val + secret);
    };

    that.isValidKey = function(key) {
        if (key) { // "name.expire-date.hash"
            var items = (""+key).split(".");
            if (items.length != 3) {
                return false;
            }
            var date = new Date(Date.parse(items[1]));
            if (date < new Date()) {
                return false; // expired
            }
            return that.createHash(items[0] + items[1]) == items[2];
        }
    };

    return that;
};

exports.UploadKey = UploadKey;