


import { isNotEmpty, useForm } from '@mantine/form';
import { PasswordInput } from '@mantine/core';
import { TextInput, Button, Box, rem } from '@mantine/core';
import classes from './Login.module.scss'
import Link from 'next/link';
import { loginApi } from '../../apiNode';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import userActions from '../../redux/action/userActions'
import { useRouter } from 'next/router';

export const Login = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const form = useForm({
        initialValues: {
            email: '',
            password: ''
        },

        validate: {
            email: (value) => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) ? null : 'Invalid email'),
            password: isNotEmpty('Enter your password'),
        },
    });
    const handleSubmitForm = async () => {
        let res: any = await loginApi(form.values)
        if (res.err) {
            toast.error(res?.exception?.response?.data)
        } else {
            toast.success("Login successfully!")
            localStorage.setItem('userDetails', JSON.stringify(res.data))
            dispatch({
                type: userActions.SET_USER_DETAILS,
                userDetails: res.data
            })
            router.push('/regex2nfa')
        }
    }
    return <div className="w-full h-full flex items-center justify-center">
        <Box
            component='div'
            w={'500px'}
        >
            <form
                className='p-[30px] rounded-xl shadow-xl'
                onSubmit={form.onSubmit(() => { handleSubmitForm() })}
            >
                <TextInput label="Email" placeholder="Email" {...form.getInputProps('email')} />
                <PasswordInput
                    classNames={classes}
                    label="Password"
                    placeholder="Password"
                    {...form.getInputProps('password')}
                />
                <Button
                    type='submit'
                    my={rem(20)}
                    w={'100%'}
                >
                    Login
                </Button>
                <p>
                    You have an account?
                    <Link href='/register' className='underline text-sky-900'>register</Link>
                </p>
            </form>
        </Box>
    </div>
}
