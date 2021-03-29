import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/api/case/list',
    method: 'get',
    params
  })
}
