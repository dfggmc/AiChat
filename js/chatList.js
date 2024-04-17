let inst = new mdui.Drawer('#chat-list', {
    swipe: true
});

$('.mdui-toolbar #toggleDrawer').on('click', function () {
    inst.toggle();
});

const defaultList =
    [
        {
            "name": "chat1",
            "uuid": crypto.randomUUID()
        }
    ]

/**
 * 更新列表
 */
function updataChatList() {
    let chatList = JSON.parse(Cookies.get('dfgg/AiChat/chatList'));
    let listContainer = $('#chat-list .list');
    // 遍历 chatList 中的每个聊天信息
    $.each(chatList, function (index, chat) {
        // 检查是否已存在具有相同 uuid 的元素
        let exists = false;
        listContainer.find('li').each(function () {
            if ($(this).attr('uuid') === chat.uuid) {
                exists = true;
                return false; // 终止循环
            }
        });

        // 如果不存在具有相同 uuid 的元素，则创建新的列表项元素并追加到列表容器中
        if (!exists) {
            const listItem = `
            <li class="mdui-list-item mdui-ripple" uuid="${chat.uuid}">
                <i class="mdui-list-item-icon mdui-icon material-icons">chat</i>
                <div class="mdui-list-item-content">
                    <div class="mdui-textfield">
                        <label class="mdui-textfield-label">${chat.name}</label>
                        <input class="mdui-textfield-input" type="text" placeholder="当前聊天新名称">
                    </div>
                </div>
            </li>
            `;
            // 将列表项追加到列表容器中
            listContainer.append(listItem);
        }
    });
}

$('#chat-list').on('click', '.new', function () {
    // 获取 cookie 中的聊天列表并转换为 JavaScript 对象
    let cookieJson = Cookies.get('dfgg/AiChat/chatList');

    // 将 JSON 字符串转换为 JavaScript 对象
    let cookie = JSON.parse(cookieJson);

    // 如果 cookie 为空或未定义，初始化为空数组
    if (!cookie) {
        cookie = [];
    }

    let newUuid;
    // 循环生成新的 UUID，直到不重复为止
    do {
        newUuid = crypto.randomUUID();
    } while (cookie.some(item => item.uuid === newUuid));

    // 向cookie列表中添加新
    cookie.push({
        "name": "new chat",
        "uuid": newUuid
    });

    // 存回 cookie
    Cookies.set('dfgg/AiChat/chatList', JSON.stringify(cookie));

    // 更新列表
    updataChatList();
});


//设置默认值
if (Cookies.get('dfgg/AiChat/chatList') === undefined) {
    Cookies.set('dfgg/AiChat/chatList', JSON.stringify(defaultList), { expires: 25565 });
}

//更新列表
$(document).ready(function () {
    updataChatList();
})