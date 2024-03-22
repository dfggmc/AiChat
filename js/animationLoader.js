/**
 * 使用 animate.css 库为指定元素添加动画效果
 * @param {string} element - 要添加动画效果的元素的选择器
 * @param {string} animation - 所需的动画效果名称
 * @param {string} speed - 动画持续时间
 * @param {string} prefix - 动画类名的前缀，默认为 'animate__'
 * @returns {Promise<string>} - 返回一个 Promise 对象，在动画结束时解析为 'Animation ended'
 */
const animatecss = (element, animation, speed, prefix = 'animate__') => {
    return new Promise((resolve) => {
        const animationName = `${prefix}${animation}`;
        const node = document.querySelector(element);
        node.classList.add(`${prefix}animated`, animationName);
        node.style.setProperty('--animate-duration', speed);
        function handleAnimationEnd() {
            node.classList.remove(`${prefix}animated`, animationName);
            node.removeEventListener('animationend', handleAnimationEnd);
            resolve('Animation ended');
        }
        node.addEventListener('animationend', handleAnimationEnd);
    });
}

// 页面加载完成时
window.addEventListener('load', () => {
    animatecss('#progress-overlay', 'fadeOut', '0.5s').then(() => {
        $('#progress-overlay').css('display', 'none');
    });
});
// 监听资源加载事件
document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
        $('#progress-overlay').css('display', 'block');
    } else if (document.readyState === 'complete') {
        animatecss('#progress-overlay', 'fadeOut', '0.5s').then(() => {
            $('#progress-overlay').css('display', 'none');
        });
    }
});