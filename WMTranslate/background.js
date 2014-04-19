/**
 * WMTranslate
 * 基于有道 Api 的 Chrome 翻译插件
 * @author simman
 * @date   2014-04-17
 */

// 定义翻译 Api 请求地址
var Url = "http://fanyi.youdao.com/openapi.do?keyfrom=simman&key=902290141&type=data&doctype=json&version=1.1&q=";

var words;
// 接收请求
chrome.extension.onRequest.addListener(onRequest);

function onRequest(request, sender, callback) {

    if (request.action == 'translateWords') {

        words = request.words;

        // 如果单词长度大于100
        if (words.length > 100) 
        {
           words = words.substr(0, 100); 
        } 
        else if (words.length < 1) 
        {
            return;
        }

        // 替换中间非英文字符
        words = words.replace(/[^a-zA-Z]/g, ' ');

        // 检测本地是否有存储
        var storageData = storage.getItem({key: words});
        if (storageData) 
        {
            // 前端处理
            callback(storageData);
            return;
        }

        // 进行网络请求
        translateWords(Url + words , callback);
    }
};

// 请求处理
function translateWords(url,callback) {
	// callback(url);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var scriptSrc = xhr.responseText;
                // var scriptSrcObj = JSON.parse(scriptSrc);
                // 设置本地数据
                storage.setItem({key:words ,value:scriptSrc});
                
                callback(scriptSrc);
            }
        }
    };
    xhr.open('get', url);
    xhr.send();
};



// userData 和 localStorage 封装累
// from: http://www.cnblogs.com/winterIce/archive/2011/09/16/2179281.html
(function(){
    userData = {
        _data : null,
        _defExpires : null,
        _saveFile : null,
        setDefExpires : function(expires){
             var This = this;
             This._defExpires = expires || 365;
        },
        setSaveFile : function(s){
             var This = this;
             This._saveFile = s || window.location.hostname;
        },
        _init : function(){
            var This = this;
            if (!This._data){
                try {
                    This._data = document.createElement('input');
                    This._data.type = "hidden";
                    This._data.addBehavior("#default#userData");   //这里一定是#default#userData
                    document.body.appendChild(This._data);
                } catch(e){
                    return false;
                }
            }
            return true;
        },

        setItem : function(opt){    //opt={file: ,key: ,value: ,e: }
            var This = this;
            if(This._init()){
                This.setDefExpires(opt.e);
                var expires = new Date();
                expires.setDate(expires.getDate()+This._defExpires);
                This._data.expires = expires.toUTCString();
                
                opt.value = typeof(opt.value) == "string" ? opt.value : T.json.stringify(opt.value);
                This.setSaveFile(opt.file);
                This._data.load(This._saveFile);
                This._data.setAttribute(opt.key,opt.value);
                This._data.save(This._saveFile);
            }
        },

        getItem : function(opt){   //opt={file: ,key: }
            var This = this;
            if(This._init()){
                This.setSaveFile(opt.file);
                This._data.load(This._saveFile);
                return This._data.getAttribute(opt.key);
            }
        },

        removeItem : function(opt){   //opt={file: ,key: }
            var This = this;
            if(This._init()){
                   This.setSaveFile(opt.file);
                   This._data.load(This._saveFile);
                   This._data.removeAttribute(opt.key);
                   This._data.save(This._saveFile);
            }
        }
    };
    /*对外接口*/
    storage = {
           /**
             *  调用storage.getItem({file: , key: });其中file可选，用于Userdata指定读取的文件名。key必选
             */
           getItem : function(opt){
               if(window.localStorage){
                    return localStorage.getItem(opt.key);
               }
               else return userData.getItem(opt);
           },
           /**
             *    调用storage.setItem({file: , key: ,value:, e:});    key,value必选,file可选，用于Userdata指定读取的文件名.e可选，用于UserData指定到期时间
             */
           setItem : function(opt){       
                if(window.localStorage){
                     opt.value = typeof(opt.value) == "string" ? opt.value : T.json.stringify(opt.value);
                     localStorage.setItem(opt.key,opt.value);
                }
                else userData.setItem(opt);
           },
           /**
             *    调用storage.removeItem({file: , key: ,clear:});其中file可选，用于Userdata指定读取的文件名.clear可选(boolean),true表示清空,false或空时就只remove掉key.
             */
           removeItem : function(opt){
                 if(window.localStorage){
                     if(opt.clear) localStorage.clear();
                     else localStorage.removeItem(opt.key);
                 }
                 else userData.removeItem(opt);
           }    
    };
})();