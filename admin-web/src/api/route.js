import request from './request'

// 获取路线列表
export const getRouteList = () => {
    return request.get('/route/list')
}

// 根据楼层获取路线
export const getRoutesByFloor = (floor) => {
    return request.get(`/route/floor/${floor}`)
}

// 推荐路线
export const recommendRoute = (minutes) => {
    return request.get(`/route/recommend`, { params: { minutes } })
}

// 新增路线
export const addRoute = (data) => {
    return request.post('/route/add', data)
}

// 更新路线
export const updateRoute = (data) => {
    return request.put('/route/update', data)
}

// 删除路线
export const deleteRoute = (id) => {
    return request.delete(`/route/delete/${id}`)
}