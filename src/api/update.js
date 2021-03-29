import requestupdate from '@/utils/requestupdate'

export function putData(body) {
  return requestupdate({
    url: '/api/case/',
    method: 'put',
    data: body
  })
}
