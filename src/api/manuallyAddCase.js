import requestupdate from '@/utils/requestupdate'

export function addData(body) {
  return requestupdate({
    url: '/api/manuallyaddcase',
    method: 'post',
    data: body
  })
}
