import headerActions from "../action/headerActions";

const initState = {
    headerSelect: 'home',
    showHeader: false,
    showLinkAutomataTool: false,
    title: '',
}

const reducer = (state = initState, action) => {
    switch (action.type) {
        case headerActions.SET_SELECT_HEADER:
            return {
                ...state,
                headerSelect: action.headerSelect
            }
        case headerActions.SET_SHOW_HEADER:
            return {
                ...state,
                showHeader: true
            }
        case headerActions.SET_HIDE_HEADER:
            return {
                ...state,
                showHeader: false
            }
        case headerActions.SET_SHOW_LINK_AUTOMATA_TOOL:
            return {
                ...state,
                showLinkAutomataTool: true
            }
        case headerActions.SET_HIDE_LINK_AUTOMATA_TOOL:
            return {
                ...state,
                showLinkAutomataTool: false
            }
        case headerActions.SET_TITLE_HEADER:
            return {
                ...state,
                title: action.title
            }
        default: {
            return state
        }
    }
}

export default reducer