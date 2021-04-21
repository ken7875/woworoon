const api_path = 'kenzou'
// fontend
const token = 'knwc0v2yH4TkU0qTDb4boE9QkjK2'
export const domain = axios.create({
    baseURL: `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}`
})

// backend
export const backendDomain = axios.create({
    headers: {
        'Authorization': token
    },
    baseURL: `https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}`
})