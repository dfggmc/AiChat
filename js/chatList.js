let inst = new mdui.Drawer('#chat-list', {
    swipe: true
});

$('.mdui-toolbar #toggleDrawer').on('click', function () {
    inst.toggle();
});
