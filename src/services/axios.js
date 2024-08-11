import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5000/',
    headers: {
        'Content-Type': 'multipart/form-data'
    }
})

// You can add interceptors here if needed
// axiosInstance.interceptors.request.use(
//   config => {
//     // Do something before request is sent
//     return config;
//   },
//   error => {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   response => {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     return response;
//   },
//   error => {
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
