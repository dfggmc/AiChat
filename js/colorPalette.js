/**
 * 设置文档主题
 * 
 * 一下代码是从mdui开原文档源码复制过来的，我稍微修改了几下
 * @link https://github.com/zdhxiong/mdui-docs-builds/blob/master/assets/docs/js/docs.js
 */
(function () {
    
    /**
     * 默认配置
     */
    var DEFAULT_LAYOUT = '';

    /**
     * 设置 cookie
     * @param {*} key 
     * @param {*} value 
     */
    var setCookie = function (key, value) {
        // cookie 有效期为 1 年
        var date = new Date();
        date.setTime(date.getTime() + 365 * 24 * 3600 * 1000);
        document.cookie = key + '=' + value + '; expires=' + date.toGMTString() + '; path=/';
    };

    /**
     * 获取cookie值的函数
     * @param {*} key 
     * @returns 
     */
    function getCookie(key) {
        var name = key + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    /**
     * 根据表单设置文档主题
     * @param {*} theme 
     */
    var setDocsTheme = function (theme) {
        if (typeof theme.layout === 'undefined') {
            theme.layout = false;
        }

        var i, len;
        var $body = $('body');

        var classStr = $body.attr('class');
        var classs = classStr.split(' ');


        // 设置主题色
        if (theme.layout !== false) {
            for (i = 0, len = classs.length; i < len; i++) {
                if (classs[i].indexOf('mdui-theme-layout-') === 0) {
                    $body.removeClass(classs[i]);
                }
            }
            if (theme.layout !== '') {
                $body.addClass('mdui-theme-layout-' + theme.layout);
            }
            setCookie('docs-theme-layout', theme.layout);
            $('input[name="doc-theme-layout"][value="' + theme.layout + '"]').prop('checked', true);
        }
    };

    // 切换主题色
    $(document).on('change', 'input[name="doc-theme-layout"]', function () {
        setDocsTheme({
            layout: $(this).val()
        });
    });

    // 恢复默认主题
    $(document).on('cancel.mdui.dialog', '#dialog-docs-theme', function () {
        setDocsTheme({
            layout: DEFAULT_LAYOUT
        });
    });

    $(document).ready(function () {
        // 从cookie中获取主题信息
        var theme = {
            layout: getCookie('docs-theme-layout') || DEFAULT_LAYOUT
        };

        // 调用setDocsTheme函数，设置主题
        setDocsTheme(theme);
    });
})();