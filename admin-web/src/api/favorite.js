import request from './request'

export const getUserFavorites = (userId) => request.get(`/favorite/list/${userId}`)
