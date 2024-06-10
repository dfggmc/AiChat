/**
 * 解析并输出
 * @param {*} data 
 * @param {blob} writeHistory 是否写入聊天记录
 * @param {*} type 消息类型 ai\user
 */
function parse(data, writeHistory = true, type = null) {
    // 获取URL中的哈希部分
    let hash = window.location.hash;
    // 通过字符串处理方法提取所需部分
    const uuid = hash.split('/').pop();
    if (type === "user") {
        $("#output").append(`
        <div class="mdui-card user-msg msg">
            <div class="ai-msg-header mdui-typo">
                <div class="mdui-card-header">
                    <img class="mdui-card-header-avatar" src="/img/user-avatar.jpg"/>
                    <div class="mdui-card-header-title">YOU</div>
                </div>
                <hr>
            <div>
            <div class="mdui-card-content mdui-typo markdown-content">${data}</div>
        </div>
        `);
        // 滚动到最底下
        window.scrollTo(0, document.body.scrollHeight);
        // 写入聊天记录
        if (writeHistory) {
            manageChatContent(uuid, 'add', `[type: 'user',txt: '${data}']`)
        }
        return null
    }

    // 渲染 Markdown 内容
    $("#output").append(`
        <div class="mdui-card ai-msg msg">
            <div class="ai-msg-header mdui-typo">
                <div class="mdui-card-header">
                    <img class="mdui-card-header-avatar" src="/img/ai-avatar.svg"/>
                    <div class="mdui-card-header-title">Ai</div>
                </div>
                <hr>
            <div>
            <div class="mdui-card-content mdui-typo markdown-content">${marked.parse(data)}</div>
        </div>
    `);

    const markdownElements = document.getElementsByClassName("markdown-content");
    MathJax.typesetPromise(markdownElements);

    // 将复制代码按钮添加到每个代码块内部
    $("#output pre").each(function () {
        var codeBlock = $(this);

        // 检查是否已经存在复制按钮
        if (!codeBlock.find('.code-copy').length) {
            var copyButton = $('<button class="mdui-btn mdui-btn-icon code-copy"><i class="mdui-icon material-icons">content_copy</i></button>');

            copyButton.on('click', function () {
                var textToCopy = codeBlock.find('code').text(); // 只复制pre内部的code元素文本内容
                navigator.clipboard.writeText(textToCopy).then(function () {
                    // 复制成功后的操作
                    copyButton.find('i').text('done'); // 修改按钮图标为 "done"
                    setTimeout(function () {
                        copyButton.find('i').text('content_copy'); // 还原按钮图标为 "content_copy"
                    }, 2000); // 2秒后恢复原状
                }, function (err) {
                    console.error('Could not copy text: ', err);
                });
            });

            // 将复制按钮添加到代码块内部
            codeBlock.prepend(copyButton);
        }
    });

    // 代码高亮
    hljs.highlightAll()
    hljs.initLineNumbersOnLoad();

    // 滚动到最底下
    window.scrollTo(0, document.body.scrollHeight);
    // 添加聊天记录
    if (writeHistory) {
        manageChatContent(uuid, 'add', `[type: 'ai',txt: '${data}']`)
    }
}