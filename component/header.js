

import headerActions from '@/redux/action/headerActions'
import styles from './header.module.scss'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'


const Header = () => {

    const headerSelect = useSelector(state => state.header.headerSelect)
    const dispatch = useDispatch()
    const handleClickLink = (nameSelect) => {
        dispatch({
            type: headerActions.SET_SELECT_HEADER,
            headerSelect: nameSelect
        })
    }

    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>Automata tools</div>
            <div className={styles.headerRight}>
                <div className={styles.containerLink}>
                    <Link onClick={() => { handleClickLink('regex2nfa') }} className={`${styles.link} ${headerSelect === 'regex2nfa' && styles.select}`}
                        href='/regex2nfa' >
                        Regex to NFA
                    </Link>
                </div>
                <div className={styles.containerLink}>
                    <Link onClick={() => { handleClickLink('nfa2dfa') }} className={`${styles.link} ${headerSelect === 'nfa2dfa' && styles.select}`}
                        href='/nfa2dfa' >
                        NFA to DFA
                    </Link>
                </div>
                <div className={styles.containerLink}>
                    <Link onClick={() => { handleClickLink('dfa2regex') }} className={`${styles.link} ${headerSelect === 'dfa2regex' && styles.select}`}
                        href='/dfa2regex' >
                        DFA to Regex
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Header