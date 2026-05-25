import axios from 'axios'
import ElementPlus from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

// 请求拦截器：自动添加 token
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器：处理错误
request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        if (error.response?.status === 401) {
            ElementPlus.ElMessage.error('请先登录')
            localStorage.removeItem('token')
            window.location.href = '/login'
        } else {
            ElementPlus.ElMessage.error(error.response?.data?.message || '请求失败')
        }
        return Promise.reject(error)
    }
)

export default request