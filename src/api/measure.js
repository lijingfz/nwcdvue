import request from '@/utils/request'

export function getCaseMeasure(params) {
  return request({
    url: '/api/caseresult/',
    method: 'get',
    params
  })
}
