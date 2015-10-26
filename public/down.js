/**
 * Created by k_morishita on 2015/10/26.
 */

var FileDownload = function (options) {
    var downloadKey = $('#' + options.downloadKey);
    var downloadButton = $('#' + options.downloadButton);
    var downBase = options.downBase;

    // event

    downloadButton.click(function () {
        var key = downloadKey.val();
        var urlParts = location.href.split('?');

        var queryString = decodeURIComponent(urlParts[1]);
        var qsList = queryString.split('&');
        var namePart = qsList[qsList.length-1];
        var name = namePart.split('=')[1];
        var noncePart = qsList[qsList.length-2];
        var nonce = noncePart.split('=')[1];

        var hashVal = CryptoJS.SHA256(nonce + key);
        location.href = downBase + '/' + hashVal + '/' + name + '?' + queryString;
    });

};

window.FileDownload = FileDownload;