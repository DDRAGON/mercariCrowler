'use strict';
const client = require('cheerio-httpcli');
const async = require('async');
const cronJob = require('cron').CronJob;

const entame_hobby_URL = 'https://www.mercari.com/jp/search/?sort_order=created_desc&keyword=&category_root=5&category_child=&brand_name=&brand_id=&size_group=&price_min=&price_max=350&shipping_payer_id%5B2%5D=1&status_on_sale=1'; // エンタメ・ホビー
const kaden_sumaho_kamera = 'https://www.mercari.com/jp/category/7/'; // 家電・スマホ・カメラ
const shokuhin_URL = 'https://www.mercari.com/jp/category/112/'; // 食料品（その他）
const antique_collection = 'https://www.mercari.com/jp/category/1256/'; // アンティーク/コレクション（その他）
const matomeuri_URL = 'https://www.mercari.com/jp/category/1108/'; // まとめ売り（その他）
const sonota_URL = 'https://www.mercari.com/jp/category/118/'; // その他（その他）
const mens_URL = 'https://www.mercari.com/jp/category/2/'; // メンズ
const ticket_URL = 'https://www.mercari.com/jp/category/1027/'; // チケット
const interi_URL = 'https://www.mercari.com/jp/category/4/'; // インテリア・住まい・小物

const mercariCrowlingURLs = [entame_hobby_URL];

var mercariDatas = [];
var newestDatas  = [];

var cronjob = new cronJob({
    cronTime: "0-59/5 * * * * *", // ５秒毎に実行
    start:    true            , // すぐにcronのjobを実行するか
    timeZone: "Asia/Tokyo"    , // タイムゾーン指定
    onTick: function() {        // 時間が来た時に実行する処理
        searchAndUpdateMercariData();
    }
});

function searchAndUpdateMercariData() {
    console.log("searchAndUpdateMercariData come!");
    var oldMercariDatas = [].concat(mercariDatas);
    var newMercariDatas = [];
    var newNeweseDatas  = [];

    async.each(mercariCrowlingURLs, function(targetURL, urlCallback) {

        client.fetch(targetURL).then(function(result) {
            result.$('section.items-box').each(function(idx) {
                const itemPrice = Number(result.$(this).find("div[class='items-box-price font-5']")[0].children[0].data.slice(2));
                if (itemPrice < 350) {
                    var itemURL  = result.$(this).find("a")[0].attribs.href;
                    itemURL = itemURL.substr( 0, itemURL.length-1 ) ;
                    const itemName = result.$(this).find("h3")[0].children[0].data;
                    const id   = itemURL.slice(itemURL.lastIndexOf('/') + 1);
                    var itemObj = {
                        name: itemName,
                        price: itemPrice,
                        id: id
                    };

                    if (isNewObj(itemObj, oldMercariDatas) === true) {
                        newNeweseDatas.push(itemObj);
                    }
                    newMercariDatas.push(itemObj);
                }
            });

            urlCallback();
        });
    },
    function(err) {
        if (err) throw err;
        mercariDatas = [].concat(newMercariDatas);
        newestDatas  = [].concat(newNeweseDatas);
    }
);
}



module.exports = {
    getMercariDatas: function () { return mercariDatas; },
    getNewestDatas: function () { return newestDatas; }
};



function isNewObj(targetObj, oldArray) {
    for (var oldKey in oldArray) {
        var oldObj = oldArray[oldKey];

        if (targetObj.id == oldObj.id) {
            return false;
        }
    }

    return true;
}
