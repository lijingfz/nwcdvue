import requestupdate from '@/utils/requestupdate'

export function putReviewData(body) {
  return requestupdate({
    url: '/api/caseresult/',
    method: 'put',
    data: body
  })
}
