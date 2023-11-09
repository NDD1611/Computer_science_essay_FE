
import { Container } from "@mantine/core";
import { Login } from "../component/LoginPage/Login";
import Header from "../component/header";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import headerActions from "../redux/action/headerActions";
const LoginPage = () => {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'Login'
        })
    }, [])


    return <div className="h-[500px]">
        <Header />
        <Login />
    </div>
}


export default LoginPage;