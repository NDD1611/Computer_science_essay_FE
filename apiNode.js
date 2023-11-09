
import axiosNode from './axiosNode'

export const registerApi = async (data) => {
    try {
        let response = await axiosNode.post('/auth/register', data)
        return response
    } catch (exception) {
        return {
            err: true,
            exception
        }
    }
}
export const loginApi = async (data) => {
    try {
        let response = await axiosNode.post('/auth/login', data)
        return response
    } catch (exception) {
        return {
            err: true,
            exception
        }
    }
}

