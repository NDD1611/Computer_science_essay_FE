import { configureStore } from '@reduxjs/toolkit'
import headerReducer from './reducer/headerReducer'
import userReducer from './reducer/userReducer'

export default configureStore({
    reducer: {
        header: headerReducer,
        user: userReducer
    }
})