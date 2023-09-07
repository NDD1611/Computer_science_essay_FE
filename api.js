
import axios from './axios'

const regex2nfa = async (regex) => {
    try {
        let response = await axios.post('/regex-to-nfa', { regex: regex })
        return response
    } catch (exception) {
        return {
            err: true,
            exception
        }
    }
}
const nfa2dfa = async (nfa) => {
    try {
        let response = await axios.post('/nfa-to-dfa', { nfa: nfa })
        return response
    } catch (exception) {
        return {
            err: true,
            exception
        }
    }
}

export default {
    regex2nfa,
    nfa2dfa
}