function main(item) {
  const channelMap = {
    // 潍坊
    "wfxwzh": [635, 1, "潍坊新闻综合"],
    "wfsh": [635, 5, "潍坊生活"],
    "wfyswy": [635, 7, "潍坊影视综艺"],
    "wfkjwl": [635, 9, "潍坊科教文旅"],
    "wfcyzh": [47, 1, "昌邑综合"],
    "wfcyjj": [47, 2, "昌邑经济生活"],
  };

  const id = item.id || 'lyzh';
  const fmt = item.fmt || 'hls';
  
  if (!channelMap[id]) {
    return JSON.stringify({ error: "频道不存在" });
  }

  const [orgId, subId] = channelMap[id];
  const apiUrl = `https://app.litenews.cn/v1/app/play/tv/live?orgid=${orgId}`;
  
  const headers = { 'User-Agent': 'Mozilla/5.0' };
  const response = ku9.get(apiUrl, JSON.stringify(headers));
  const liveData = JSON.parse(response);
  
  let stream = '';
  if (liveData && liveData.data) {
    for (const item of liveData.data) {
      if (item.id == subId) {
        stream = item.stream;
        break;
      }
    }
  }
  
  if (stream) {
    return JSON.stringify({ url: stream });
  } else {
    return JSON.stringify({ error: "直播地址获取失败" });
  }
}
