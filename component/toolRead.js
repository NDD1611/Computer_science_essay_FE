
import { getEpsilonClosure, transition_function_star } from '@/utils/commonFunctions'
import styles from './toolRead.module.scss'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons'

const ToolRead = ({
    automata,
    typeAutomata,
    setNodeAfterRead = () => { }
}) => {
    const [text, setText] = useState('')
    const [arrayString, setArrayString] = useState([])
    const [start, setStart] = useState(false)
    const [indexString, setIndexString] = useState(-1)
    const [stringRead, setStringRead] = useState('')
    const [showAccept, setShowAccept] = useState(false)
    const [showReject, setShowReject] = useState(true)

    const handleChangeInput = (e) => {
        let string = e.target.value
        setText(string)
        let array = string.split('')
        setArrayString(array)
    }
    const handleStart = () => {
        if (typeAutomata == 'nfaEpsilon') {
            let epsilonClosure = getEpsilonClosure(automata.initial_state, automata.transition_function)
            console.log(epsilonClosure)
            setNodeAfterRead(epsilonClosure)
        }

        setStart(true)
        setShowAccept(false)
        setShowReject(true)
    }
    const handleStop = () => {
        setStart(false)
        setIndexString(-1)
        setNodeAfterRead([])
    }
    const handleSepback = () => {
        let nextIndex = indexString - 1
        setIndexString(nextIndex)
        setStringRead(text.slice(0, nextIndex - 1))
    }
    const handleReadNext = () => {
        let nextIndex = indexString + 1
        setIndexString(nextIndex)
        setStringRead(text.slice(0, nextIndex + 1))
    }
    const handleReadAll = () => {
        if (typeAutomata == 'nfaEpsilon') {
            let states = stringAcceptByNfaEpsilon(text, automata)
            if (text.length) {
                if (states) {
                    let check = false
                    states.forEach(state => {
                        if (automata.final_states.includes(state)) {
                            check = true
                        }
                    })
                    setShowAccept(check)
                    setShowReject(check)
                }
            }
            setNodeAfterRead(states)
        }
    }

    const stringAcceptByNfaEpsilon = (string, nfaEpsilon) => {
        let preResult = getEpsilonClosure(nfaEpsilon.initial_state, nfaEpsilon.transition_function)
        for (let i = 0; i < string.length; i++) {
            let alphabet = string[i]
            if (preResult) {
                let listTotal = []
                preResult.forEach(state => {
                    let listStateAfterReadAlphabet = nfaEpsilon.transition_function[state][alphabet]
                    listTotal = [...listTotal, ...listStateAfterReadAlphabet]
                })
                if (listTotal) {
                    let listClosureOfManyState = []
                    listTotal.forEach(state => {
                        let closeEachState = getEpsilonClosure(state, nfaEpsilon.transition_function)
                        listClosureOfManyState = [...listClosureOfManyState, ...closeEachState]
                    })
                    preResult = listClosureOfManyState
                }
            }
        }
        return preResult
    }
    useEffect(() => {
        if (typeAutomata == 'nfaEpsilon') {
            let states = stringAcceptByNfaEpsilon(stringRead, automata)
            if (text.length === stringRead.length) {
                if (states) {
                    let check = false
                    states.forEach(state => {
                        if (automata.final_states.includes(state)) {
                            check = true
                        }
                    })
                    setShowAccept(check)
                    setShowReject(check)
                }
            }
            setNodeAfterRead(states)
        }
    }, [stringRead])

    return (
        <div className={styles.toolRead}>
            <input className={styles.input}
                value={text}
                onChange={handleChangeInput}
                placeholder='String...'
            />
            <div className={styles.arrayString}>
                {
                    arrayString.map((character, index) => {
                        return <span className={indexString == index && styles.indexStringCurrent}
                            key={index}>
                            {character}
                        </span>
                    })
                }
                {showAccept && <span className={styles.marginLeft}>true</span>}
                {!showReject && <span className={styles.marginLeft}>false</span>}
            </div>
            <div className={styles.listBtns}>
                {
                    !start && <button
                        onClick={handleStart}
                    >
                        Start
                    </button>
                }
                {
                    start &&
                    <button
                        onClick={handleStop}
                    >
                        Stop
                    </button>
                }
                <button onClick={handleSepback}>
                    <FontAwesomeIcon className={styles.iconMarginRight} icon={faBackward} />
                    Step backward
                </button>
                <button
                    onClick={handleReadNext}
                >Read next
                    <FontAwesomeIcon className={styles.iconMarginLeft} icon={faForward} />
                </button>
                <button
                    onClick={handleReadAll}
                >Read all</button>
            </div>
        </div >
    )
}
export default ToolRead