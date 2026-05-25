import request from './request'

// 登录
export const login = (data) => {
    return request.post('/user/login', data)
}

// 注册（公开，只能创建 tourist）
export const register = (data) => {
    return request.post('/user/register', data)
}

// 管理员创建用户（可指定 role）
export const adminCreateUser = (data) => {
    return request.post('/user/admin/create', data)
}

// 获取用户列表
export const getUserList = () => {
    return request.get('/user/list')
}

// 获取当前用户信息
export const getCurrentUser = () => {
    return request.get('/user/current')
}

// 更新用户
export const updateUser = (data) => {
    return request.put('/user/update', data)
}

// 删除用户
export const deleteUser = (id) => {
    return request.delete(`/user/delete/${id}`)
}