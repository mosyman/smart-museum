import request from './request'

// 获取展品列表
export const getExhibitList = () => {
    return request.get('/exhibit/list')
}

// 获取展品详情
export const getExhibitById = (id) => {
    return request.get(`/exhibit/${id}`)
}

// 获取热门展品
export const getHotExhibits = () => {
    return request.get('/exhibit/hot')
}

// 按分类获取
export const getByCategory = (category) => {
    return request.get(`/exhibit/category/${category}`)
}

// 新增展品
export const addExhibit = (data) => {
    return request.post('/exhibit/add', data)
}

// 更新展品
export const updateExhibit = (data) => {
    return request.put('/exhibit/update', data)
}

// 删除展品
export const deleteExhibit = (id) => {
    return request.delete(`/exhibit/delete/${id}`)
}