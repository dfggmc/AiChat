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
        return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    parse(input, true, "user");

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
        "https://api.lolimi.cn/API/AI/gpt4.php": {
            "data": `msg=${encodeURIComponent(input)}`,
            "method": "GET",
            "dataType": "TEXT"
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
        let output;
        // 判断是否为JSON，处理不同API输出格式
        if (dataType === 'JSON') {
            // 如果输出内容为空
            if (!response.data.output) {
                throw new Error(`输出内容为空！`);
            }
            output = response.data.output;
        } else {
            // 如果输出内容为空
            if (!response) {
                throw new Error(`输出内容为空`);
            }
            output = response;
        }
        parse(output);
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
                            <img class="mdui-card-header-avatar" src="https://image.dfggmc.top/imgs/2024/06/46daca418fde6f47.png"/>
                            <div class="mdui-card-header-title">ERROR</div>
                        </div>
                        <div class="mdui-card-content mdui-color-red-a400" id="markdown-content">请求API ${url} 时出错, 错误原因: ${error}, 正在尝试请求其他API</div>
                    </div>
                    `);
                    makeRequest();
                    return
                })
        }
    }
    makeRequest();

}