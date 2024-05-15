/**
 * 主函数（入口函数）
 * @returns 
 */
function main(input) {

    $('#input').val("");
    const footer = $('footer');
    const msgSendBtn = footer.find('#msg-send');
    const progressContainer = footer.find('.progress-container');

    /**
     * 过滤HTML
     * @param {*} html 
     * @returns 
     */
    function filterHTML(html) {
        // 定义正则表达式，用于匹配 HTML 标签
        var regex = /(<([^>]+)>)/ig;
        // 使用空字符串替换匹配到的 HTML 标签
        return html.replace(regex, "");
    }

    if (!input) {
        // 多行文本框
        mdui.prompt('请输入内容！',
            function (value) {
                input = filterHTML($('footer textarea').val().trim());
                main(filterHTML(value)); // 重新调用 main 函数
            },
            function () {
                return
            },
            {
                confirmOnEnter: true,
                confirmText: 'Enter/点击确认',
                cancelText: '取消',
                type: 'text',
            }
        );
        progressContainer.hide();
        return;
    }

    input = filterHTML(input);

    progressContainer.show();
    msgSendBtn.prop('disabled', true);
    $("#output").append(`
    <div class="mdui-card user-msg msg">
        <div class="ai-msg-header mdui-typo">
            <div class="mdui-card-header">
                <img class="mdui-card-header-avatar" src="/img/user-avatar.jpg"/>
                <div class="mdui-card-header-title">You</div>
            </div>
            <hr>
        <div>
        <div class="mdui-card-content mdui-typo markdown-content">${input}</div>
    </div>
    `)

    // 滚动到最底下
    window.scrollTo(0, document.body.scrollHeight);

    /**
     * API JSON 列表
     */
    const apiUrl = {
        "https://api.lolimi.cn/API/AI/gemini.php": {
            "data": `msg=${encodeURIComponent(input)}`,
            "method": "GET",
            "dataType": "JSON"
        },
        "https://api.lolimi.cn/API/AI/c.php": {
            "data": `[
                        {
                            "role": "user",
                            "content": "${encodeURIComponent(input)}"
                        }
                    ]`,
            "method": "POST",
            "dataType": "TEXT"
        },
    };
    // 取出KEY
    const urls = Object.keys(apiUrl);
    let index = 0;
    /**
     * 处理响应
     * @param {*} response 
     * @param {*} dataType 
     */
    function handleResponse(response, dataType) {
        // 判断是否为JSON，处理不同API输出格式
        if (dataType === 'JSON') {
            // 如果输出内容为空
            if (response.data.output === '') {
                throw new Error(`API请求异常:${response.data.output}`);
            }
            parse(response.data.output);
        } else {
            // 如果输出内容为空
            if (response === '') {
                throw new Error(`API请求异常:${response.data.output}`);
            }
            parse(response);
        }
    }
    /**
     * 遍历请求json数组，如果某个请求失败则调用下一个请求直到最后一个
     */
    function makeRequest() {
        if (index < urls.length) {
            const url = urls[index];
            const { data, method, dataType } = apiUrl[url];

            sendRequest(url, method, dataType, data)
                .then(response => {
                    handleResponse(response, dataType);
                    msgSendBtn.prop('disabled', false);
                    progressContainer.hide();
                })
                .catch(error => {
                    index++;
                    $("#output").append(`
                    <div class="mdui-card sys-msg msg">
                        <div class="mdui-card-header mdui-color-red-a200">
                            <img class="mdui-card-header-avatar" src="https://www.leye.site/Public/images/error_logo.png"/>
                            <div class="mdui-card-header-title">ERROR</div>
                        </div>
                        <div class="mdui-card-content mdui-color-red-a400" id="markdown-content">equest to ${url} failed:, ${error}</div>
                    </div>
                    `);
                    makeRequest();
                    return
                })
        }
    }
    makeRequest();

}
