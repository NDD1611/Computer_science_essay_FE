import graphActions from "../action/graphActions";

const initState = {
    linkLength: 200
}

const reducer = (state = initState, action) => {
    switch (action.type) {
        case graphActions.SET_LINK_LENGTH:
            return {
                ...state,
                linkLength: action.linkLength
            }
        default: {
            return state
        }
    }
}

export default reducer