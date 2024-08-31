/**
 * 解析并输出消息内容
 * @param {string} data - 要解析和显示的内容
 * @param {boolean} [writeHistory=true] - 是否写入聊天记录，默认为true
 * @param {string|null} [type=null] - 消息类型，可以是 'ai' 或 'user'
 */
function parse(data, writeHistory = true, type = null) {
    // 获取当前URL中的哈希部分，用于唯一标识会话
    const uuid = window.location.hash.split('/').pop();

    /**
     * 将用户输入的文本转为适当的HTML，保留换行和空格
     * @param {string} text - 用户输入的文本
     * @returns {string} - 转换后的HTML
     */
    function preserveTextFormat(text) {
        return text
            .replace(/</g, '&lt;')  // 转义HTML标签
            .replace(/>/g, '&gt;')  // 转义HTML标签
            .replace(/\n/g, '<br>')  // 将换行符替换为 <br> 标签
            .replace(/ {2}/g, '&nbsp;&nbsp;');  // 将连续的两个空格替换为 &nbsp;&nbsp;
    }

    /**
     * 向页面追加消息内容
     * @param {string} avatar - 头像图片路径
     * @param {string} title - 消息标题（如 AI 或 YOU）
     * @param {string} content - 消息的具体内容
     * @param {string} cardClass - 包含消息的卡片的CSS类
     */
    function appendMessage(avatar, title, content, cardClass) {
        $("#output").append(`
            <div class="mdui-card ${cardClass} msg">
                <div class="ai-msg-header mdui-typo">
                    <div class="mdui-card-header">
                        <img class="mdui-card-header-avatar" src="${avatar}"/>
                        <div class="mdui-card-header-title">${title}</div>
                    </div>
                    <hr>
                <div>
                <div class="mdui-card-content mdui-typo markdown-content">${content}</div>
            </div>
        `);
    }

    if (type === "user") {
        // 显示用户的消息，保留文本格式
        const formattedData = preserveTextFormat(data);
        appendMessage("/img/user-avatar.jpg", "YOU", formattedData, "user-msg");

        // 滚动页面到底部
        window.scrollTo(0, document.body.scrollHeight);

        // 如果启用了写入聊天记录，则保存聊天记录
        if (writeHistory) {
            manageChatContent(uuid, 'add', `[type: 'user', txt: '${window.btoa(unescape(encodeURIComponent(data)))}']`);
        }
        return;
    }

    // 渲染 AI 的 Markdown 内容
    appendMessage("/img/ai-avatar.svg", "Ai", marked.parse(data), "ai-msg");

    // 渲染 MathJax 数学公式
    MathJax.typesetPromise(document.getElementsByClassName("markdown-content"));

    // 为代码块添加复制按钮
    $("#output pre").each(function () {
        const codeBlock = $(this);

        // 检查代码块是否已包含复制按钮，避免重复添加
        if (!codeBlock.find('.code-copy').length) {
            const copyButton = $('<button class="mdui-btn mdui-btn-icon code-copy"><i class="mdui-icon material-icons">content_copy</i></button>');

            copyButton.on('click', function () {
                const textToCopy = codeBlock.find('code').text(); // 复制代码内容

                navigator.clipboard.writeText(textToCopy).then(() => {
                    // 复制成功后的反馈
                    copyButton.find('i').text('done'); // 修改按钮图标为 "done"
                    setTimeout(() => {
                        copyButton.find('i').text('content_copy'); // 恢复原图标
                    }, 2000); // 2秒后恢复原状
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });

            // 将复制按钮添加到代码块的前面
            codeBlock.prepend(copyButton);
        }
    });

    // 代码高亮及行号处理
    hljs.highlightAll();
    hljs.initLineNumbersOnLoad();

    // 滚动页面到底部
    window.scrollTo(0, document.body.scrollHeight);

    // 如果启用了写入聊天记录，则保存聊天记录
    if (writeHistory) {
        manageChatContent(uuid, 'add', `[type: 'ai', txt: '${window.btoa(unescape(encodeURIComponent(data)))}']`);
    }
}