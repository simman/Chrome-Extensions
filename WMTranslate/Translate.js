/**
 * WMTranslate
 * 基于有道 Api 的 Chrome 翻译插件
 * @author simman
 * @date   2014-04-17
 */

// 鼠标按下的位置，用于判断鼠标是不是有很大的位移
var moveX, moveY;
var mouseDownX, mouseDownY;
var pX, pY;
var words;
var dictVoiceUrl = "http://dict.youdao.com/dictvoice?audio="

// 添加鼠标监听事件
$(document).ready(function()
{
    // 计算鼠标移动坐标
    $(document).mousemove(function(e)
    {
        moveX = e.pageX, moveY = e.pageY;
    });
    // 计算鼠标落下的坐标
    $(document).mousedown(function(e)
    {     
        // $("#cluetip").remove();
        mouseDownX = e.pageX;
        mouseDownY = e.pageY;
    });
    // 鼠标划词翻译
    $(document).mouseup(function(e)
    {
        if ( Math.abs(e.pageX - mouseDownX) > 2 || Math.abs(e.pageY - mouseDownY) > 2)
        {
            wordsHandle();
        }
    });
    // 鼠标双击单词翻译
    $(document).dblclick(function(e)
    {
        wordsHandle();
    });

    $("#btnOpenSetting").bind("click", { pageUrl: strPageUrl, thWidth: strThWidth }, DoCheck);

    $("#btnOpenSetting").click(function () {
        palya();
        console.log('------');
    });
});

// 单词处理
function wordsHandle()
{
    // 获取单词
    words = document.selection == undefined ? document.getSelection().toString():document.selection.createRange().text;
    // console.log(words);
    // 判断单词不为空并且长度大于1
    if (words != "" && words.length > 1)
    {
        // 向后台发送请求，通过 Api 获取单词释义
        chrome.extension.sendRequest({ 'action': 'translateWords', 'words': words }, function handle(response) 
        { 
            // 前端处理
            messageDetail(response);
        });
    }
}

// 前端页面显示
function messageDetail(str)
{
    console.log('response: ' + str);

    $("#cluetip").remove();

    palya();

    notify(str);

    tipBox(str);
}


function palya()
{
    var youdaoTTSUrl = "http://tts.youdao.com/fanyivoice?keyfrom=fanyi%2Eweb%2Eindex&le={{lang}}&word={{text}}";
    
    var TTSUrl = encodeURI(youdaoTTSUrl.replace("{{lang}}", 'en').replace("{{text}}", words));

    Media = new Audio(TTSUrl);

    if (Media.paused) {
        Media.startTime = 0;
    }

    Media.play();
}

function tipBox(str)
{

    var obj = JSON.parse(str);

    var phonetic = obj.basic.phonetic;
    
    var explain = obj.basic.explains;

    explain = explain.join('<br />');

    $('<div id="cluetip" style="filter:alpha(Opacity=80);-moz-opacity:0.5;opacity: 0.8; position: absolute; width: 275px; left: 121px; z-index: 97; top: {{top}}px; left: {{left}}px; box-shadow: rgba(0, 0, 0, 0.498039) 1px 1px 6px; display: block;" class="cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default"><script type="text/javascript">function playThisWords(){var TTSUrl = "http://tts.youdao.com/fanyivoice?keyfrom=fanyi%2Eweb%2Eindex&le={{lang}}&word={{text}}"; Media = new Audio(TTSUrl); Media.play();}</script><div class="cluetip-outer" style="position: relative; z-index: 97; overflow: visible; height: auto;"><h3 class="cluetip-title ui-widget-header ui-cluetip-header" style="font-weigh:10px;">{{title}}</h3><div class="cluetip-inner ui-widget-content ui-cluetip-content" style="font-size:9px;">{{explain}}<div class="split-body"><input type="submit" class="btnOpenSetting" value="Play" /></div></div></div><div class="cluetip-extra"></div></div>'.replace("{{top}}", mouseDownY + 10).replace("{{left}}", mouseDownX).replace("{{title}}", words + '        [' + phonetic + ']').replace("{{lang}}", 'en').replace("{{text}}", words).replace("{{explain}}", explain)).appendTo("body");
}



function notify(str) {
     if (window.webkitNotifications) {    //判断是否支持该功能
         if (window.webkitNotifications.checkPermission() == 0) {    //判断是否允许弹出桌面通知
             //文本模式创建通知         createHTMLNotification    createNotification
             var deskBox = window.webkitNotifications.createNotification('icon.png', words, str);
             //当显示时调用
             deskBox.ondisplay = function(event) {
                 //自动关闭
                 setTimeout(function() {
                     event.currentTarget.cancel();
                 }, 10 * 1000);
             };
             //当出错时调用
             deskBox.onerror = function() {};
             //当关闭时调用
             deskBox.onclose = function() {};
             //当点击时调用
             deskBox.onclick = function(event) {    
                 //点击跳转页面
                 window.focus();

                window.open("http://dict.youdao.com/search?q=" + words);

                 //关闭通知
                 event.currentTarget.cancel();
             };
             //
             deskBox.replaceId = 'box1';
             //显示通知
             deskBox.show();        
             //关闭通知
             //deskBox.cancel();    
 
         } else {
             //询问用户是否允许提示
             window.webkitNotifications.requestPermission(notify);
         }
     }
}
