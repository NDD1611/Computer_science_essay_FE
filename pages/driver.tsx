import { useEffect } from 'react';
import { DriverPage } from '../component/DriverPage/DriverPage'
import { useDispatch } from 'react-redux';
import headerActions from '../redux/action/headerActions';
const Driver = () => {
    const dispatch = useDispatch()
    useEffect(() => {

        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'My driver'
        })
        dispatch({
            type: headerActions.SET_SELECT_HEADER,
            headerSelect: 'driver'
        })

    }, [])

    return <>
        <DriverPage />
    </>
}

export default Driver;