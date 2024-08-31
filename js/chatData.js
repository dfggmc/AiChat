let db;
// 打开或创建数据库
function openDatabase() {
    let request = window.indexedDB.open("chatData", 1);
    request.onerror = (event) => {
        console.error(event);
        mdui.snackbar({
            message: `打开indexedDB失败！请检测您的浏览器是否支持！！！`,
            position: 'right-bottom',
        });
    };
    request.onsuccess = (event) => {
        db = event.target.result;
        db.onerror = (event) => {
            console.error(`聊天列表内容错误 ${event.target.errorCode}`)
            mdui.snackbar({
                message: `聊天列表内容错误 ${event.target.errorCode}`,
                position: 'right-bottom',
            });
        };
        // 更新列表
        updateChatList();
    };
    // 新建表
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        let objectStore;
        if (!db.objectStoreNames.contains('chatList')) {
            objectStore = db.createObjectStore('chatList', { keyPath: 'uuid' });
            objectStore.createIndex('list', 'name', { unique: false });
            objectStore.createIndex('content', 'content', { unique: false });
        }
    }
}
// 生成唯一的UUID
function generateUniqueUUID() {
    let uuid = crypto.randomUUID();
    // 检查是否存在重复的UUID
    while (isUUIDDuplicate(uuid)) {
        uuid = crypto.randomUUID(); // 重新生成UUID
    }
    return uuid;
}
// 检查UUID是否重复
function isUUIDDuplicate(uuid) {
    // 在数据库中检查是否存在相同的UUID
    let transaction = db.transaction(['chatList'], 'readonly');
    let objectStore = transaction.objectStore('chatList');
    let request = objectStore.get(uuid);
    request.onsuccess = function (event) {
        let existingChat = event.target.result;
        if (existingChat) {
            // 如果存在相同的UUID，则返回true
            return true;
        } else {
            // 如果不存在相同的UUID，则返回false
            return false;
        }
    };
}


/**
 * 添加新聊天
 * @param {*} name 
 * @returns 
 */
function addNewChat(name) {
    // 确保在数据库已经打开后才进行添加操作
    if (!db) {
        console.error("数据库尚未打开");
        return;
    }
    let transaction = db.transaction(['chatList'], 'readwrite');
    let objectStore = transaction.objectStore('chatList');
    let newChat = {
        uuid: generateUniqueUUID(), // 生成唯一的UUID
        name: name
    };
    let addRequest = objectStore.add(newChat);
    addRequest.onsuccess = function (event) {
        // 添加成功后更新列表
        updateChatList();
    };
    addRequest.onerror = function (event) {
        console.log('数据写入失败，错误信息：', event.target.error);
        mdui.snackbar({
            message: `数据写入失败，错误信息：${event.target.error}`,
            position: 'right-bottom',
        });
    };
}
/**
 * 查询指定UUID的聊天记录内容，并根据指定的方法执行相应的操作
 * @param {string} uuid 聊天的UUID
 * @param {Array} contentToAdd 要添加的聊天内容数组只有method为add才需要传入，格式如下：
 *        [
 *            type: "ai",
 *            txt: "<p>Hello! Welcome to our chat. How can I assist you today?</p>"
 *        ]
 * @param {string} method 操作方法，'query'表示查询，'add'表示插入
 */
function manageChatContent(uuid, method, contentToAdd = null) {
    // 确保在数据库已经打开后才进行操作
    if (!db) {
        console.error("数据库尚未打开");
        return;
    }
    let transaction = db.transaction(['chatList'], 'readwrite');
    let objectStore = transaction.objectStore('chatList');
    if (method === 'query') {
        let getRequest = objectStore.get(uuid);
        return new Promise((resolve, reject) => {
            getRequest.onsuccess = function (event) {
                let chatRecord = event.target.result.content;
                if (!chatRecord) {
                    resolve([]); // 返回空数组表示没有记录
                    return;
                }
                // 解析聊天记录
                const parsedRecords = [];
                const recordRegex = /\[type:\s*'([^']*)',\s*txt:\s*'([^']*)'\]/g;
                let match;
                while ((match = recordRegex.exec(chatRecord)) !== null) {
                    const [, type, text] = match;
                    parsedRecords.push({ type, text });
                }
                if (parsedRecords.length === 0) {
                    console.error(`未找到可解析的聊天记录：`, chatRecord);
                    reject(new Error(`未找到可解析的聊天记录`));
                } else {
                    resolve(parsedRecords);
                }
            };
            getRequest.onerror = function (event) {
                console.error(`获取UUID为 ${uuid} 的聊天记录失败，错误信息：`, event.target.error);
                reject(event.target.error);
            };
        });
    } else if (method === 'add') {
        return new Promise((resolve, reject) => {
            // 验证内容格式是否正确
            const contentRegex = /\[type:\s*'([^']*)',\s*txt:\s*'([^']*)'\]/;
            if (!contentRegex.test(contentToAdd)) {
                reject(`添加的内容格式不正确\n ${contentToAdd} \n`);
                return;
            }
            // 开启一个事务来获取列表记录
            let listTransaction = db.transaction(['chatList'], 'readwrite');
            let listObjectStore = listTransaction.objectStore('chatList');
            let getRequest = listObjectStore.get(uuid);
            // 处理获取列表记录的成功事件
            getRequest.onsuccess = function (event) {
                let listRecord = event.target.result;
                if (listRecord) {
                    // 如果UUID存在于列表中，则开始一个新的事务来获取聊天记录
                    let chatTransaction = db.transaction(['chatList'], 'readwrite');
                    let chatObjectStore = chatTransaction.objectStore('chatList');
                    let chatGetRequest = chatObjectStore.get(uuid);
                    // 处理获取聊天记录的成功事件
                    chatGetRequest.onsuccess = function (event) {
                        let chatRecord = event.target.result;
                        if (chatRecord) {
                            // 更新现有聊天记录
                            chatRecord.content = (chatRecord.content || []).concat(contentToAdd);
                            let updateRequest = chatObjectStore.put(chatRecord);
                            updateRequest.onsuccess = function (event) {
                                resolve();
                            };
                            updateRequest.onerror = handleDBError;
                        } else {
                            // 如果不存在聊天记录，则创建一个新的聊天记录对象并添加内容
                            let newChatRecord = {
                                uuid: uuid,
                                content: [contentToAdd]
                            };
                            // 将新的聊天记录对象添加到数据库中
                            let addRequest = chatObjectStore.add(newChatRecord);
                            addRequest.onsuccess = function (event) {
                                resolve();
                            };
                            addRequest.onerror = handleDBError;
                        }
                    };
                    chatGetRequest.onerror = handleDBError;
                } else {
                    // 如果UUID不存在于列表中，则发出警告
                    console.warn(`UUID为 ${uuid} 不存在于列表中`);
                    reject(`UUID为 ${uuid} 不存在于列表中`);
                }
            };
            // 处理获取列表记录的失败事件
            getRequest.onerror = handleDBError;
            // 错误处理函数
            function handleDBError(event) {
                console.error(`数据库操作失败，错误信息：`, event.target.error);
                reject(event.target.error);
            }
        });
    } else {
        console.error(`无效的操作方法：${method}`);
    }
}
/**
 * 删除指定 UUID 的聊天
 * @param {*} uuid 
 * @returns 
 */
function deleteChat(uuid) {
    // 确保在数据库已经打开后才进行删除操作
    if (!db) {
        console.error("数据库尚未打开");
        return;
    }
    let transaction = db.transaction(['chatList'], 'readwrite');
    let objectStore = transaction.objectStore('chatList');
    let deleteRequest = objectStore.delete(uuid);
    deleteRequest.onsuccess = function (event) {
        // 删除成功后更新列表
        updateChatList();
    };
    deleteRequest.onerror = function (event) {
        console.error(`删除 UUID 为 ${uuid} 的聊天失败，错误信息：`, event.target.error);
        mdui.snackbar({
            message: `删除聊天失败，错误信息：${event.target.error}`,
            position: 'right-bottom',
        });
    };
    return true;
}
/**
 * 更新聊天列表
 * @returns 
 */
function updateChatList() {
    if (!db) {
        console.error("数据库尚未打开");
        return;
    }
    let transaction = db.transaction(['chatList'], 'readonly');
    let objectStore = transaction.objectStore('chatList');
    let chatListRequest = objectStore.getAll();
    chatListRequest.onsuccess = function (event) {
        let chatList = event.target.result;
        let listContainer = $('#chat-list .list');
        listContainer.empty(); // 清空列表容器
        // 遍历获取到的聊天列表并更新到页面上
        chatList.forEach(chat => {
            const listItem = `
            <li class="mdui-list-item mdui-ripple" uuid="${chat.uuid}" name="${chat.name}">
                <i class="mdui-list-item-icon mdui-icon material-icons">chat</i>
                <button class="mdui-btn mdui-btn-icon mdui-btn-raised delete">
                    <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
                </button>
                <div class="mdui-list-item-content">
                    <div class="mdui-textfield">
                        <label class="mdui-textfield-label">${chat.name}</label>
                        <input class="mdui-textfield-input" type="text" placeholder="新名称">
                    </div>
                </div>
            </li>
            `;
            // 将列表项追加到列表容器中
            listContainer.append(listItem);
        });
        // 元素内的点击事件
        $('#chat-list .list li').on('click', function () {
            $("#output").html("");
            // 添加mdui-list-item-active类到被点击的a元素
            $(this).addClass('mdui-list-item-active');
            // 移除其他同级a元素的mdui-list-item-active类
            $(this).siblings().removeClass('mdui-list-item-active');
            // 更新URL
            window.history.replaceState('', $(this).attr('name'), `/#/chat/${$(this).attr('uuid')}`);
            // 更新聊天内容
            // 调用 manageChatContent 函数获取聊天记录
            manageChatContent($(this).attr('uuid'), 'query')
                .then((data) => {
                    // 检查是否有聊天记录
                    if (data && data.length > 0) {
                        // 遍历聊天记录，并将其输出到页面上
                        data.forEach((record, index) => {
                            // 构建消息元素并添加到页面中
                            parse(decodeURIComponent(escape(window.atob(record.text))), false, record.type)
                        });
                    } else {
                        $('#output').append(`                    
                            <div class="mdui-card msg"> 
                                <div class="mdui-card-content mdui-color-amber-a400" id="markdown-content">
                                    暂无聊天记录，点击侧边栏切换别的或者在输入框开始和AI聊天吧！
                                <div>
                            </div>
                        `);
                    }
                })
                .catch((error) => {
                    // 如果获取聊天记录失败，则显示错误信息
                    console.error('获取聊天记录失败：', error);
                    $('#output').append(`                    
                    <div class="mdui-card sys-msg msg">
                        <div class="mdui-card-header mdui-color-red-a200">
                            <img class="mdui-card-header-avatar" src="https://image.dfggmc.top/imgs/2024/06/46daca418fde6f47.png"/>
                            <div class="mdui-card-header-title">ERROR</div>
                        </div>
                        <div class="mdui-card-content mdui-color-red-a400" id="markdown-content">获取聊天记录失败：${error}</div>
                    </div>`);
                });
        });
        $('#chat-list .list li .delete').on('click', function () {
            let uuid = $(this).closest('li').attr('uuid');
            let name = $(this).closest('li').attr('name');
            mdui.snackbar({
                message: `<i class="mdui-icon material-icons">warning</i>确认删除 ${name} 吗？(点击其他位置取消！)`,
                buttonText: '确认',
                position: 'left-bottom',
                onButtonClick: function () {
                    if (deleteChat(uuid)) {
                        $("#output").html("");
                        mdui.snackbar({
                            message: `<i class="mdui-icon material-icons">done</i>成功删除 ${name}`,
                            position: 'left-bottom',
                        });
                    }
                },
            });
        });
    };
}

// 添加新聊天
$('#chat-list').on('click', '.new', function () {
    let newChatName = "New Chat"; // 默认新聊天的名称
    addNewChat(newChatName);
});
// 初始化，打开数据库并更新列表
$(document).ready(function () {
    openDatabase();
});