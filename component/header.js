

import headerActions from '../redux/action/headerActions'
import styles from './header.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, NavLink, Text, rem } from '@mantine/core'
import { IconArrowBigRightLines, IconGauge } from '@tabler/icons-react';
import userActions from '../redux/action/userActions'


const Header = () => {
    const showHeader = useSelector(state => state.header.showHeader)
    const title = useSelector(state => state.header.title)
    const showLinkAutomataTool = useSelector(state => state.header.showLinkAutomataTool)
    const userDetails = useSelector(state => state.user.userDetails)
    const dispatch = useDispatch()
    const router = useRouter()
    let id = null

    const handleClickBarIcon = (e) => {
        e.stopPropagation()
        let leftShowStart = -250
        let leftHideStart = 0
        let navBarElement = document.querySelector('.' + styles.containerNavBar)
        //${showHeader ? styles.showNavBar : styles.hideNavBar}
        const show = () => {
            if (leftShowStart >= 0) {
                clearInterval(id);
            } else {
                leftShowStart = leftShowStart + 10
                navBarElement.style.left = leftShowStart + 'px';
            }
        }
        const hide = () => {
            if (leftHideStart <= -250) {
                clearInterval(id);
            } else {
                leftHideStart = leftHideStart - 10
                navBarElement.style.left = leftHideStart + 'px';
            }
        }
        if (showHeader) {
            setInterval(hide, 10)
            dispatch({
                type: headerActions.SET_HIDE_HEADER
            })
        } else {
            setInterval(show, 10)
            dispatch({
                type: headerActions.SET_SHOW_HEADER
            })
        }
    }
    useEffect(() => {
        let navBarElement = document.querySelector('.' + styles.containerNavBar)
        if (showHeader) {
            navBarElement.style.left = '0px'
        } else {
            navBarElement.style.left = '-250px'
        }

        let useDetailLocal = JSON.parse(localStorage.getItem('userDetails'))
        if (useDetailLocal) {
            dispatch({
                type: userActions.SET_USER_DETAILS,
                userDetails: useDetailLocal
            })
        }
        return () => {
            clearInterval(id)
        }
    }, [])

    const handleClickLink = (path) => {
        router.push(path)
    }
    const handleClickAutomataTool = () => {
        if (showLinkAutomataTool) {
            dispatch({
                type: headerActions.SET_HIDE_LINK_AUTOMATA_TOOL
            })
        } else {
            dispatch({
                type: headerActions.SET_SHOW_LINK_AUTOMATA_TOOL
            })
        }
    }

    return (
        <div className={styles.header}>
            <div className={styles.bars}
                onClick={handleClickBarIcon}
            >
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div className={styles.title} >
                {title}
            </div>
            <div className='text-white w-[150px] flex items-center justify-center gap-[10px]'>
                {
                    userDetails != null &&
                    <Text>{userDetails.name}</Text>
                }
                {
                    userDetails == null &&
                    <Button onClick={() => { handleClickLink('/login') }}>
                        <IconArrowBigRightLines />
                        <Text
                            ml={rem(5)}
                        >
                            SIGN IN
                        </Text>
                    </Button>
                }
            </div>
            <div className={`${styles.containerNavBar}`}>
                <NavLink
                    label="Automata tools"
                    leftSection={<IconGauge size="1rem" stroke={1.5} />}
                    childrenOffset={28}
                    classNames={styles}
                >
                    <NavLink
                        classNames={styles}
                        label="Regex to NFAε"
                        onClick={() => { handleClickLink('/regex2nfa') }}
                    />
                    <NavLink
                        classNames={styles}
                        label="NFAε to NFA"
                        onClick={() => { handleClickLink('/nfaEpsilon2Nfa') }}
                    />
                    <NavLink
                        classNames={styles}
                        label="NFA to DFA"
                        onClick={() => { handleClickLink('/nfa2dfa') }}
                    />
                    <NavLink
                        classNames={styles}
                        label="DFA to Regex"
                        onClick={() => { handleClickLink('/dfa2regex') }}
                    />
                </NavLink>
                <NavLink
                    label="My driver"
                    leftSection={<IconGauge size="1rem" stroke={1.5} />}
                    childrenOffset={28}
                    classNames={styles}
                >
                    <NavLink
                        classNames={styles}
                        label="Regex to NFAε"
                        onClick={() => { handleClickLink('/regex2nfa') }}
                    />
                    <NavLink
                        classNames={styles}
                        label="NFAε to NFA"
                        onClick={() => { handleClickLink('/nfaEpsilon2Nfa') }}
                    />
                    <NavLink
                        classNames={styles}
                        label="NFA to DFA"
                        onClick={() => { handleClickLink('/nfa2dfa') }}
                    />
                    <NavLink
                        classNames={styles}
                        label="DFA to Regex"
                        onClick={() => { handleClickLink('/dfa2regex') }}
                    />
                </NavLink>
            </div>
        </div>
    )
}

export default Header
