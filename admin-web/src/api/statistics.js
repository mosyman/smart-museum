import request from './request'

// 获取热门展品统计
export const getHotExhibit = () => {
    return request.get('/statistics/hot-exhibit')
}

// 获取人流量统计
export const getVisitorFlow = () => {
    return request.get('/statistics/visitor-flow')
}

// 获取分类统计
export const getCategoryStats = () => {
    return request.get('/statistics/category-stats')
}

// 获取访问趋势（近7天）
export const getVisitTrend = () => {
    return request.get('/statistics/visit-trend')
}