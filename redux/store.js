import { configureStore } from '@reduxjs/toolkit'
import headerReducer from './reducer/headerReducer'

export default configureStore({
    reducer: {
        header: headerReducer
    }
})