
import Header from "../component/header";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import headerActions from "../redux/action/headerActions";
import { Register } from "../component/RegisterPage/Register";
const RegisterPage = () => {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'Register'
        })
    }, [])


    return <div className="h-[500px]">
        <Header />
        <Register />
    </div>
}


export default RegisterPage;