const version = '0.0.1'
const ContainerHtml = `
<link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/mdui/1.0.2/css/mdui.min.css">
<link rel="stylesheet" href="https://cdn.staticfile.org/aplayer/1.10.1/APlayer.min.css">
<style>
	#music-player-container #music-player-settings {
        border-radius: 10px;
        display: none;
    }

    #music-player-container #music-player-settings .mdui-switch {
        height: 14.3;
    }

    #music-player-container #music-player-settings button {
        margin: 0.4rem;
    }

    #music-player-container #music-player-settings .mdui-icon {
        margin-right: 5px;
    }

    #music-player-container #music-player-settings-update {
        border-radius: 10px;
        display: none;
    }

    #music-player-container #music-player-settings-update .mdui-dialog-content {
        padding-top: 30px;
    }
</style>
<div id="music-player-settings" class="mdui-dialog">
	<div class="mdui-dialog-title mdui-color-grey-900">
		<i class="mdui-icon material-icons">queue_music</i>音乐播放器设置<i class="music-playlist-version"></i>
	</div>
	<div class="mdui-dialog-content">
		<ul class="mdui-list">
			<li class="mdui-list-item">
				<i class="mdui-list-item-icon mdui-icon material-icons">music_note</i>
				<div class="mdui-list-item-title">音乐播放器开关</div>
				<div class="mdui-list-item-content">
					<label class="mdui-switch">
						<input class="music-playlist-switch" name="music-playlist-switch" type="checkbox">
						<i class="mdui-switch-icon"></i>
					</label>
				</div>
			</li>
			<li class="mdui-list-item">
				<i class="mdui-list-item-icon mdui-icon material-icons">play_arrow</i>
				<div class="mdui-list-item-title">自动播放开关</div>
				<div class="mdui-list-item-content">
					<label class="mdui-switch">
						<input class="music-playlist-autoplay" name="music-playlist-autoplay" type="checkbox">
						<i class="mdui-switch-icon"></i>
					</label>
				</div>
			</li>
			<li class="mdui-list-item">
				<i class="mdui-list-item-icon mdui-icon material-icons">wb_cloudy</i>
				<div class="mdui-list-item-title">音乐平台</div>
				<div class="mdui-list-item-content">
					<select class="mdui-select music-playlist-server" name="music-playlist-server">
						<option value="netease">网易云音乐（默认）</option>
						<option value="tencent">QQ音乐</option>
						<option value="kugou">酷狗音乐</option>
						<option value="xiami">虾米音乐</option>
						<option value="baidu">百度音乐</option>
					</select>
					<i class="mdui-select-icon"></i>
				</div>
			</li>
			<li class="mdui-list-item">
				<i class="mdui-list-item-icon mdui-icon material-icons">vpn_key</i>
				<div class="mdui-list-item-title">音乐歌单ID</div>
				<div class="mdui-list-item-content music-playlist-id-input">
					<input class="mdui-textfield-input music-playlist-id" name="music-playlist-id" type="number">
				</div>
			</li>
			<li class="mdui-list-item">
				<i class="mdui-list-item-icon mdui-icon material-icons">code</i>
				<div class="mdui-list-item-title">自定义歌词样式</div>
				<div class="mdui-list-item-content mdui-textfield">
					<textarea class="mdui-textfield-input music-playlist-lyric-style" rows="4" placeholder='JSON格式，不用加<style></style>例子：{"background-color":"#98bf21","top": "30px"}'></textarea>
				</div>
			</li>
		</ul>
	</div>
	<div class="mdui-dialog-actions mdui-color-grey-100">
		<button class="mdui-btn mdui-ripple mdui-text-color-black-text" mdui-dialog-confirm onclick="musicPlayerSaveSettings()">
			<i class="mdui-icon material-icons">done_all</i>保存配置并生效
		</button>
		<button class="mdui-btn mdui-ripple mdui-text-color-black-text" mdui-dialog-cancel onclick="musicPlayerReadConfiguration()">
			<i class="mdui-icon material-icons">cancel</i>取消
		</button>
	</div>
</div>
<div id="music-player-settings-update" class="mdui-dialog">
	<div class="mdui-dialog-title mdui-color-grey-900">
		<i class="mdui-icon material-icons">queue_music</i>音乐播放器设置-<i class="mdui-icon material-icons">update</i>检测更新
	</div>
	<div class="mdui-dialog-content mdui-typo">
		<i>检查更新中……</i>
		<div class="mdui-progress">
			<div class="mdui-progress-indeterminate"></div>
		</div>
	</div>
	<div class="mdui-dialog-actions mdui-color-grey-100">
		<button class="mdui-btn mdui-ripple mdui-text-color-black-text" mdui-dialog-close mdui-dialog="{target: '#music-player-settings'}">
			<i class="mdui-icon material-icons">arrow_back</i>返回设置
		</button>
	</div>
</div>
<div id="meting-js"></div>
`
console.log(
    `%c音乐播放器设置由 https://github.com/XiaoFeng-QWQ 提供技术支持\nMusic player is set to provide technical support by https://github.com/XiaoFeng-QWQ\n%c Version 版本: %c ${version} `,
    'color: #3eaf7c; font-size: 16px;line-height:30px;',
    'background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff',
    'background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff',
)

/**
 * 检测更新
 * 
 */
function musicPlayerSettingsUpdate() {
    const upDataUrl = 'https://api.github.com/repos/XiaoFeng-QWQ/music-player/releases/latest'
    $.ajax({
        type: "GET",
        url: upDataUrl,
        dataType: "JSON",
        success: function (data) {
            $('#music-player-container #music-player-settings-update .mdui-dialog-content')
                .html(`
                <p>
                    最新版本:
                    ${data.tag_name}
                <p>
                <hr>
                    <p>
                        <a href="${data.assets[0].browser_download_url}" target="_blank" rel="noopener noreferrer">下载链接</a>
                        <a href="${data.html_url}" target="_blank" rel="noopener noreferrer">详情页</a>
                    </p>
                <hr>
                <p>
                    更新日志: 
                </p>
                ${data.body}
            ` )
        },
        error: function (error) {
            $('#music-player-container #music-player-settings-update .mdui-dialog-content')
                .html(`
            <p>
            检查更新失败: ${error.status} ${error.responseJSON.message}
            </p>
            ` )
        }
    });
}
/**
 * musicPlayerConfiguration函数用于读取或修改音乐播放器的配置
 * @param {string} method - 操作类型，'read' 用于读取配置，'edit' 用于修改配置
 * @param {Array} data - 传递的数据，针对不同操作类型有不同的含义
 */
function musicPlayerConfiguration(method, data) {
    /**
     * 默认配置对象
     */
    const defaultConfig = {
        "enable": true,
        "autoplay": true,
        "listId": "2939725092",
        "server": "netease",
        "lyricStyle": null
    }
    /**
     * 保存配置
     * @param {Object} config - 待保存的配置对象
     */
    function saveConfig(config) {
        const expiresDate = new Date()
        expiresDate.setFullYear(expiresDate.getFullYear() + 10)
        document.cookie = `musicPlayerConfiguration=${JSON.stringify(config)}; expires=${expiresDate.toUTCString()}; path=/`
    }
    /**
     * 获取当前配置
     * @returns {Object} 当前配置对象
     */
    function getConfig() {
        const cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)musicPlayerConfiguration\s*=\s*([^;]*).*$)|^.*$/, "$1");
        if (cookieValue !== undefined && cookieValue.trim() !== "") {
            try {
                return JSON.parse(cookieValue)
            } catch (error) {
                mdui.snackbar({
                    message: `<i class="mdui-icon material-icons">warning</i>无法解析 cookie 中的 JSON 数据:${error}`,
                })
            }
        } else {
            saveConfig(defaultConfig)
            //返回默认值
            return defaultConfig
        }
    }
    const config = getConfig()
    //根据传入参数读取或修改
    switch (method) {
        case "read":
            if (data) {
                if (Array.isArray(data)) {
                    const result = {}
                    // 遍历传入的键数组
                    data.forEach(key => {
                        // 如果配置中存在对应的键，则返回该键的值，否则返回undefined
                        result[key] = config.hasOwnProperty(key) ? config[key] : undefined
                    })
                    return result
                } else {
                    // 如果只传递一个键，则直接返回该键的值
                    return config.hasOwnProperty(data) ? config[data] : undefined
                }
            } else {
                return config
            }
        case "edit":
            // 遍历传入的键值对数组
            if (Array.isArray(data)) {
                data.forEach(([key, value]) => {
                    if (config.hasOwnProperty(key)) {
                        // 如果配置中存在对应的键，则修改对应键的值
                        config[key] = value
                    } else if (defaultConfig.hasOwnProperty(key)) {
                        // 如果配置中不存在对应的键，但默认配置中存在，则使用默认配置的值
                        config[key] = defaultConfig[key]
                    } else {

                    }
                })
                saveConfig(config)
                // 如果传递的数据是一个长度为2的数组，则将第一个元素作为键，第二个元素作为值
            } else if (data.length === 2) {
                const [key, value] = data
                if (config.hasOwnProperty(key)) {
                    // 如果配置中存在对应的键，则修改对应键的值
                    config[key] = value
                    saveConfig(config)

                } else if (defaultConfig.hasOwnProperty(key)) {
                    // 如果配置中不存在对应的键，但默认配置中存在，则使用默认配置的值
                    config[key] = value
                    saveConfig(config)

                } else {

                }
            } else {

            }
            break
        default:
            break
    }
}
/**
 * 更新音乐播放器
 * 
 */
function updateMusicPlayerConfig() {
    const config = musicPlayerConfiguration('read')
    const musicPlayerContainer = $('#music-player-container #meting-js')
    const metingJs = musicPlayerContainer.find('meting-js')
    const playerLrc = musicPlayerContainer.find('.aplayer-lrc')
    if (config.enable) {
        if (metingJs.length === 0) {
            //创建音乐播放器
            const musicPlayerHTML = `
                <meting-js
                    fixed="true"
                    preload="metadata"
                    mutex="true"
                    volume="0.3"
                    autotheme="false"
                    storage="AllFixed"
                    order="list"
                    server="${config.server}"
                    type="playlist"
                    id="${config.listId}"
                    "${config.autoplay ? "autoplay=true" : "autoplay=false"}"
                >
                </meting-js>`
            musicPlayerContainer.html(musicPlayerHTML)
        } else {
            //更新音乐播放器属性
            metingJs.attr({
                'autoplay': config.autoplay,
                'server': config.server,
                'id': config.listId
            })
            playerLrc.css(config.lyricStyle)
        }
    } else {
        metingJs.remove()
    }
}
/**
 * 设置表单默认值
 * 
 */
function musicPlayerReadConfiguration() {
    const config = musicPlayerConfiguration('read')
    const lyricStyle = JSON.stringify(config.lyricStyle, null, 4); // 进行格式化
    $('#music-player-settings .music-playlist-switch')
        .prop('checked', config.enable)
    $('#music-player-settings .music-playlist-autoplay')
        .prop('checked', config.autoplay)
    $('#music-player-settings .music-playlist-id')
        .val(config.listId)
    $('#music-player-settings .music-playlist-server')
        .val(config.server)
    $('#music-player-settings .music-playlist-lyric-style')
        .val(lyricStyle);
    //更新音乐播放器
    updateMusicPlayerConfig()
}
/**
 * 保存设置
 * 
 */
function musicPlayerSaveSettings() {
    const enable = $('#music-player-settings .music-playlist-switch')
        .is(':checked')
    const autoplay = $('#music-player-settings .music-playlist-autoplay')
        .is(':checked')
    const listId = $('#music-player-settings .music-playlist-id')
        .val()
    const server = $('#music-player-settings .music-playlist-server')
        .val()
    const lyricStyle = $('#music-player-settings .music-playlist-lyric-style')
        .val();
    // 尝试解析 JSON，如果解析失败则抛出错误
    if (typeof lyricStyle === 'string') {
        try {
            const lyricObjStyle = JSON.parse(lyricStyle);
            // 如果解析成功，可以将 lyricObjStyle 传入 musicPlayerConfiguration 进行保存
            if (typeof lyricObjStyle === 'object' && lyricObjStyle) {
                musicPlayerConfiguration('edit', [
                    ['enable', enable],
                    ['autoplay', autoplay],
                    ['listId', listId],
                    ['server', server],
                    ['lyricStyle', lyricObjStyle]
                ]);
                mdui.snackbar({
                    position: 'bottom',
                    message: '保存成功，如果不生效请刷新页面'
                });
                musicPlayerReadConfiguration();
            } else {
                mdui.snackbar({
                    position: 'bottom',
                    message: '样式属性格式错误，请检查后重新输入'
                });
            }
        } catch (error) {
            mdui.snackbar({
                position: 'bottom',
                message: `样式属性格式错误，请检查后重新输入 ${error}`
            });
        }
    } else {
        mdui.snackbar({
            position: 'bottom',
            message: '样式属性格式错误，请检查后重新输入'
        });
    }
}


class MusicPlayerSettings {
    loadScript() {
        //获取绝对路径
        var js = document.scripts;
        var scriptPath;
        for (var i = js.length; i > 0; i--) {
            if (js[i - 1].src.indexOf("music-player-setting.V0.0.1.js") > -1) {
                scriptPath = js[i - 1].src.substring(0, js[i - 1].src.lastIndexOf("/") + 1);
            }
        }
        //加载js，顺序不能反
        function loadScript(src) {
            var script = document.createElement('script');
            script.src = src;
            script.async = false; // 这样可以保证按照顺序加载和执行脚本
            document.head.appendChild(script);
        }
        var scripts = [
            'https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js',
            'https://cdn.bootcdn.net/ajax/libs/mdui/1.0.2/js/mdui.min.js',
            'https://cdn.staticfile.org/aplayer/1.10.1/APlayer.min.js',
            //生成音乐播放器
            `${scriptPath}/musicPlayer/MusicPlayer.js`,
            `${scriptPath}/musicPlayer/Meting.js`,
        ];
        scripts.forEach(function (src) {
            loadScript(src);
        });
    }

    /**
     * 主函数（入口函数）
     */
    mian() {
        this.loadScript()
        window.addEventListener('load', function () {
            //生成音乐播放器元素
            var element = document.getElementById('music-player-container');
            element.innerHTML = ContainerHtml;

            //初始化mdui组件
            new mdui.Select('#music-player-settings .music-playlist-server', {
                position: "bottom"
            })
            //读取音乐播放器配置
            musicPlayerReadConfiguration()
            $('#music-player-settings .music-playlist-version')
                .html(`Version:${version}`)
        })
    }
}