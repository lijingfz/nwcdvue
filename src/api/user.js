import request from '@/utils/request'

export function login(data) {
  // console.log('jingamz!', data)
  return request({
    // url: '/vue-admin-template/user/login',
    url: '/api/login',
    method: 'post',
    data
  })
}

// adjust input parameter
export function getInfo(token, userid) {
  return request({
    url: '/api/user/' + userid,
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// export function logout() {
//   return {
//     code: 20000,
//     data: 'success'
//   }
// }
