/**
 * 发送请求
 * @param {*} url 
 * @param {GETPOST} method 请求方法
 * @param {*} dataType 返回数据类型
 * @param {Array} data 传递的数据
 * @returns 
 */
function sendRequest(url, method, dataType, data = null) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            data: data,
            method: method,
            dataType: dataType,
            success: function (data) {
                    if (dataType === 'json') {
                        resolve(data);
                    } else {
                        resolve(data);  // 对于文本格式数据直接resolve
                    }
            },
            error: function (xhr, status, error) {
                reject(new Error(`请求失败 ${xhr} ${status} ${error}`));
            }
        });
    });
}