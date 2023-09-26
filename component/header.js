

import headerActions from '@/redux/action/headerActions'
import styles from './header.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'


const Header = () => {
    const showHeader = useSelector(state => state.header.showHeader)
    const title = useSelector(state => state.header.title)
    const showLinkAutomataTool = useSelector(state => state.header.showLinkAutomataTool)
    const dispatch = useDispatch()
    const router = useRouter()
    let id = null

    const handleClickBarIcon = () => {
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
            <div className={styles.bars} onClick={handleClickBarIcon}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div className={styles.title} >
                {title}
            </div>
            <div className={`${styles.containerNavBar}`}>
                <div>
                    <div className={styles.groupChoose}
                        onClick={handleClickAutomataTool}
                    >
                        <div className={styles.groupIcon}>
                            {
                                showLinkAutomataTool ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />
                            }

                        </div>
                        Automata tools
                    </div>
                    <div className={`${styles.listLinks} ${!showLinkAutomataTool && styles.hideLink}`}>
                        <div className={styles.linkContainer}
                            onClick={() => { handleClickLink('/regex2nfa') }}
                        >
                            Regex to NFAε
                        </div>
                        <div className={styles.linkContainer}
                            onClick={() => { handleClickLink('/nfaEpsilon2Nfa') }}
                        >
                            NFAε to NFA
                        </div>
                        <div className={styles.linkContainer}
                            onClick={() => { handleClickLink('/nfa2dfa') }}
                        >
                            NFA to DFA
                        </div>
                        <div className={styles.linkContainer}
                            onClick={() => { handleClickLink('/dfa2regex') }}
                        >
                            DFA to Regex
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header