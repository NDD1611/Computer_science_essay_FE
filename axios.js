
import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 100000
})


export default instance;