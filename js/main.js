/**
 * 主函数（入口函数）
 * @param {string} input - 用户输入的内容
 */
function main(input) {
    // 获取页面底部的元素，如发送按钮、进度容器和文本区域
    const footer = $('footer');
    const msgSendBtn = footer.find('#msg-send');
    const progressContainer = footer.find('.progress-container');
    const textarea = footer.find('textarea');

    /**
     * 重置输入框的值为空
     */
    function resetInput() {
        $('#input').val("");
    }

    /**
     * 过滤HTML，防止XSS攻击，仅用于在页面上显示内容
     * @param {string} html - 需要过滤的HTML字符串
     * @returns {string} 过滤后的安全HTML字符串
     */
    function filterHTML(html) {
        return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * 弹出对话框提示用户输入内容
     */
    function promptForInput() {
        mdui.prompt('请输入内容！',
            // 如果用户确认输入，则再次调用main函数处理输入内容
            (value) => main(value.trim() || textarea.val().trim()),
            // 如果用户取消，则不执行任何操作
            () => { },
            {
                confirmOnEnter: true, // 用户按回车键即可确认输入
                confirmText: 'Enter/点击确认', // 确认按钮的文本
                cancelText: '取消', // 取消按钮的文本
                type: 'text', // 输入类型为文本
            }
        );
        // 隐藏进度条容器
        progressContainer.hide();
    }

    /**
     * 处理API响应，根据不同的数据类型处理返回的数据
     * @param {Object} response - API响应的数据
     * @param {string} dataType - 数据类型（JSON或TEXT）
     */
    function handleResponse(response, dataType) {
        // 根据dataType判断如何提取输出内容
        const output = dataType === 'JSON' ? response?.data?.output : response;
        if (!output) {
            // 如果输出为空，抛出错误
            throw new Error('输出内容为空！');
        }
        // 调用parse函数解析输出
        parse(output);
    }

    /**
     * 递归遍历API请求数组，如果某个请求失败，则尝试下一个请求
     * @param {Array} apiUrls - 包含所有API请求配置的数组
     * @param {number} index - 当前请求的索引
     */
    function makeRequest(apiUrls, index = 0) {
        // 如果所有请求都已尝试完毕，退出递归
        if (index >= apiUrls.length) return;

        // 取出当前索引对应的API请求配置
        const { url, data, method, dataType } = apiUrls[index];

        // 发送请求
        sendRequest(url, method, dataType, data)
            .then(response => {
                // 处理响应并恢复UI状态
                handleResponse(response, dataType);
                msgSendBtn.prop('disabled', false);
                progressContainer.hide();
            })
            .catch(error => {
                // 如果请求失败，显示错误信息并尝试下一个API
                $("#output").append(`
                    <div class="mdui-card sys-msg msg">
                        <div class="mdui-card-header mdui-color-red-a200">
                            <img class="mdui-card-header-avatar" src="https://image.dfggmc.top/imgs/2024/06/46daca418fde6f47.png"/>
                            <div class="mdui-card-header-title">ERROR</div>
                        </div>
                        <div class="mdui-card-content mdui-color-red-a400" id="markdown-content">请求API ${url} 时出错, 错误原因: ${error}, 正在尝试请求其他API</div>
                    </div>
                `);
                // 递归调用下一个API请求
                makeRequest(apiUrls, index + 1);
            });
    }

    /**
     * 初始化API请求
     * @param {string} input - 用户输入的内容
     */
    function initiateRequest(input) {
        // 配置API请求列表（这里只配置了一个API）
        const apiUrls = [
            {
                url: "https://apii.lolimi.cn/api/c4o/c?key=F0Q5A7MMukiINTuVuSxDGYnlC7",
                data: JSON.stringify([{ "role": "user", "content": encodeURIComponent(input) }]),
                method: "POST",
                dataType: "TEXT"
            }
        ];

        // 显示进度条并禁用发送按钮
        progressContainer.show();
        msgSendBtn.prop('disabled', true);
        // 将用户输入内容解析显示在页面上，过滤HTML
        parse(filterHTML(input), true, "user");
        // 滚动页面到最底部
        window.scrollTo(0, document.body.scrollHeight);

        // 开始请求API
        makeRequest(apiUrls);
    }

    // 首先重置输入框内容
    resetInput();

    if (!input) {
        // 如果输入为空，提示用户输入内容
        promptForInput();
    } else {
        // 如果有输入内容，开始处理请求
        initiateRequest(input.trim());
    }
}