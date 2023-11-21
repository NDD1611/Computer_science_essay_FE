


import { isNotEmpty, useForm } from '@mantine/form';
import { PasswordInput } from '@mantine/core';
import { TextInput, Button, Box, rem, Flex, Notification } from '@mantine/core';
import classes from './Register.module.scss'
import Link from 'next/link';
import { registerApi } from '../../apiNode'
import { toast } from 'react-toastify'

export const Register = () => {

    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },

        validate: {
            email: (value) => (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) ? null : 'Invalid email'),
            password: isNotEmpty('Enter your password'),
            confirmPassword: (value, values) =>
                value !== values.password ? 'Passwords did not match' : null,
        },
    });
    const handleSubmitForm = async () => {
        let res: any = await registerApi(form.values)
        if (res.err) {
            toast.error(res?.exception?.response?.data)
        } else {
            toast.success(res?.data)
        }
    }
    return <div className="w-full h-full flex items-center justify-center">
        <Box
            component='div'
            w={'500px'}
        >
            <form className=' p-[30px] rounded-xl shadow-xl'
                onSubmit={form.onSubmit(() => { handleSubmitForm() })}
            >
                <TextInput label="Name" placeholder="Name" {...form.getInputProps('name')} />
                <TextInput label="Email" placeholder="Email" {...form.getInputProps('email')} />
                <PasswordInput
                    classNames={classes}
                    label="Password"
                    placeholder="Password"
                    {...form.getInputProps('password')}
                />
                <PasswordInput
                    mt="sm"
                    label="Confirm password"
                    placeholder="Confirm password"
                    {...form.getInputProps('confirmPassword')}
                />
                <Button
                    type='submit'
                    w={'100%'}
                    my={'20px'}
                >
                    Register
                </Button>
                <p>
                    You have an account?
                    <Link href='/login' className='underline text-sky-900'>login</Link>
                </p>
            </form>
        </Box>
    </div>
}
