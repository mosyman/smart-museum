// 后端 API 地址统一配置
// 开发：http://localhost:8081（PC 浏览器/微信开发者工具模拟器）
// 真机调试：改成电脑局域网 IP，如 http://192.168.1.5:8081
// 生产：改成线上域名（且必须 HTTPS，要在微信公众平台配置 request 合法域名）
const baseUrl = 'http://localhost:8081'

module.exports = {
  baseUrl
}
