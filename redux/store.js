import { configureStore } from '@reduxjs/toolkit'
import headerReducer from './reducer/headerReducer'
import userReducer from './reducer/userReducer'
import graphReducer from './reducer/graphReducer'

export default configureStore({
    reducer: {
        header: headerReducer,
        user: userReducer,
        graph: graphReducer
    }
})