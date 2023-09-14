import headerActions from "../action/headerActions";

const initState = {
    headerSelect: 'home'
}

const reducer = (state = initState, action) => {
    switch (action.type) {
        case headerActions.SET_SELECT_HEADER:
            return {
                ...state,
                headerSelect: action.headerSelect
            }
        default: {
            return state
        }
    }
}

export default reducer