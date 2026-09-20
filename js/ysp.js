function main(item) {
    const url = item.url;
    const id = ku9.getQuery(url, "id");
    const domain = id.split('/');

    // 根据域名设置不同User-Agent
    const isMobileDomain = ['www.cditv.cn', 'www.cbg.cn'].includes(domain[2]);
    const headers = {
        'User-Agent': isMobileDomain ? 
            'Mozilla/5.0 (Linux; Android 10; HMA-AL00 Build/HUAWEIHMA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.93 Mobile Safari/537.36' :
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
    };

    const jscode = `
    (function() {
        /* 初始化环境 */
        const startTime = Date.now();
        const maxWaitTime = 15000;
        let videoFound = false;

        /* 设置基础样式 */
        const initStyle = () => {
            document.documentElement.style.cssText = 'background:black !important; margin:0 !important; padding:0 !important;';
            document.body.style.cssText = 'visibility:hidden; margin:0 !important; padding:0 !important; background:black !important;';
        };

        /* 创建全屏容器 */
        const createContainer = () => {
            const container = document.createElement('div');
            container.style.cssText = \`
                position:fixed !important;
                top:0 !important;
                left:0 !important;
                width:100vw !important;
                height:100vh !important;
                z-index:2147483647 !important;
                background:black !important;
                display:flex !important;
                justify-content:center !important;
                align-items:center !important;
                overflow:hidden !important;
            \`;
            return container;
        };

        /* 处理视频元素 */
        const processVideo = (video) => {
            if(videoFound) return;
            videoFound = true;

            /* 移除控制条 */
            const removeElements = [
                '.prism-controlbar', '.prism-big-play-btn', 'xg-controls',
                '.control-bar', '.vjs-control-bar', '.controls'
            ];
            removeElements.forEach(selector => {
                document.querySelectorAll(selector).forEach(e => e.remove());
            });

            /* 配置视频属性 */
            video.style.cssText = \`
                width:100% !important;
                height:auto !important;
                max-width:100% !important;
                max-height:100% !important;
                object-fit:contain !important;
            \`;
            video.removeAttribute('controls');
            video.autoplay = true;
            video.muted = false;
            video.volume = 1;
            video.playsInline = true;

            /* 创建视频容器 */
            const container = createContainer();
            container.appendChild(video.cloneNode(true));
            document.body.innerHTML = '';
            document.body.appendChild(container);

            /* 强制触发播放 */
            const newVideo = container.querySelector('video');
            const playAttempt = setInterval(() => {
                newVideo.play().catch(() => {
                    newVideo.muted = true;
                    newVideo.play();
                }).finally(() => {
                    clearInterval(playAttempt);
                });
            }, 300);

            /* 处理全屏 */
            const enterFullscreen = () => {
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(() => {
                        container.style.position = 'absolute';
                        container.style.width = '100%';
                        container.style.height = '100%';
                    });
                }
            };
            setTimeout(enterFullscreen, 500);

            /* 最终显示 */
            document.body.style.visibility = 'visible';
        };

        /* Shadow DOM检测 */
        const searchInShadow = (node) => {
            if (node.shadowRoot) {
                const shadowVideo = node.shadowRoot.querySelector('video');
                if (shadowVideo) return shadowVideo;
                node.shadowRoot.querySelectorAll('*').forEach(child => {
                    const result = searchInShadow(child);
                    if (result) return result;
                });
            }
            return null;
        };

        /* 主检测逻辑 */
        const checkVideo = () => {
            if (Date.now() - startTime > maxWaitTime) {
                document.body.style.visibility = 'visible';
                return;
            }

            /* 优先检测Shadow DOM */
            const shadowVideo = searchInShadow(document.body);
            if (shadowVideo) return processVideo(shadowVideo);

            /* 普通DOM检测 */
            const videos = document.querySelectorAll('video');
            if (videos.length > 0) {
                return processVideo(videos[videos.length - 1]);
            }

            /* 延迟检测 */
            setTimeout(checkVideo, 300);
        };

        /* 初始化执行 */
        initStyle();
        document.addEventListener('DOMContentLoaded', checkVideo);
        new MutationObserver(checkVideo).observe(document, {
            childList: true,
            subtree: true,
            attributes: true
        });
        checkVideo();
    })();
    `;

    return {
        webview: id,
        headers: headers,
        jscode: jscode
    };
}
