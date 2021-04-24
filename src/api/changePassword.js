import requestupdate from '@/utils/requestupdate'

export function changepwd(body) {
  return requestupdate({
    url: '/api/update',
    method: 'post',
    data: body
  })
}
