import request from './request'

export const getUserFootprint = (userId) => request.get(`/visit/footprint/${userId}`)
export const getUserReport    = (userId) => request.get(`/visit/report/${userId}`)
