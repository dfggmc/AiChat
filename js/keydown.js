/**
 * 键盘快捷键处理
 * 
 */
// Shift + Enter 发送请求
const textarea = document.querySelector('footer textarea');
textarea.addEventListener('keydown', function (event) {
    console.debug(event.key)
    // 检测按钮是否被禁用(是否正在发送请求)
    if ($('footer').find('#msg-send').prop('disabled') !== true) {
        if (event.shiftKey && event.key === 'Enter') {
            // 阻止默认的 Enter 键行为（例如，防止在 form 中提交）
            event.preventDefault();
            // 调用主函数
            main($('footer textarea').val().trim());
        }
    }
});