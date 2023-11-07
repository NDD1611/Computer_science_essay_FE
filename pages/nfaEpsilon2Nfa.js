
import styles from './nfaEpsilon2Nfa.module.scss'
import { useEffect, useState } from 'react';
import {
    getEpsilonClosure,
    listLinkToTransitionFunctionForNFA,
    transitionFunctionToLinks,
    transition_function_star
} from '../utils/commonFunctions'
import Header from '@/component/header';
import { useDispatch } from 'react-redux';
import headerActions from '@/redux/action/headerActions';
import Loader from '@/component/Loader';
import IntroduceForce from '@/component/introduceForce';
import IntroduceDraw from '@/component/introduceDraw';
import IntroduceDelete from '@/component/introduceDelete';
import IntroduceEdit from '@/component/introduceEdit';
import ToolDraw from '@/component/toolDraw';
import ToolDisplay from '@/component/toolDisplay';
import ToolRead from '@/component/toolRead';

const NfaEpsilon2Nfa = () => {
    const [mode, setMode] = useState(0) // 0: force, 1: draw, 2: delete, 3: edit
    const [nodes, setNodes] = useState([])
    const [linkLength, setLinkLength] = useState(200)
    const [links, setLinks] = useState([])
    const [widthSvg, setWidthSvg] = useState(400)
    const [heightSvg, setHeightSvg] = useState(400)
    const [radiusCircle, setRadiusCircle] = useState(30)
    const [finalStates, setFinalStates] = useState([])
    const [initStates, setInitStates] = useState('')
    const dispatch = useDispatch()
    const [dataShowNfa, setDataShowNfa] = useState(false)
    const [nfa, setNfa] = useState({})

    const transition_function_comma = (nfa) => {
        let states = nfa.states
        let transition_function = nfa.transition_function
        let alphabets = nfa.alphabets
        let nfaTransition = {}
        states.forEach(state => {
            nfaTransition[state] = {}
            alphabets.forEach(alphabet => {
                if (alphabet != '$') {
                    nfaTransition[state][alphabet] = []
                    let stateStars = transition_function_star(state, alphabet, transition_function)
                    let transitionFinals = []
                    if (stateStars.length) {
                        stateStars.forEach(stateStar => {
                            let epsilonClosureOfStateStar = getEpsilonClosure(stateStar, transition_function)
                            if (epsilonClosureOfStateStar.length) {
                                epsilonClosureOfStateStar.forEach(stateClosureStar => {
                                    if (!transitionFinals.includes(stateClosureStar)) {
                                        transitionFinals.push(stateClosureStar)
                                    }
                                })
                            }
                        })
                    }
                    nfaTransition[state][alphabet] = transitionFinals
                }
            })
        })
        return nfaTransition
    }
    let handleSubmit = async () => {
        setShowLoader(true)
        let states = nodes.map(node => {
            return node.id
        })
        let alphabets = []
        if (links) {
            links.forEach(link => {
                if (!alphabets.includes(link.label) && link.label) {
                    alphabets.push(link.label)
                }
            })
        }
        let transition_function = listLinkToTransitionFunctionForNFA(states, links)
        let nfa = {
            states: states,
            initial_state: initStates,
            final_states: finalStates,
            alphabets: alphabets,
            transition_function: transition_function
        }

        let nfaTransition = transition_function_comma(nfa)

        let newAlphabets = alphabets.filter(alpha => {
            return alpha != '$'
        })

        // let nfaNoEpsilon = {
        //     states: states,
        //     initial_state: initStates,
        //     final_states: finalStates,
        //     alphabets: newAlphabets,
        //     transition_function: nfaTransition
        // }
        let closure = getEpsilonClosure(initStates, transition_function)
        let check = false
        if (finalStates) {
            finalStates.forEach((state) => {
                if (closure.includes(state)) {
                    check = true
                }
            })
        }
        let newFinalState = finalStates
        if (check) {
            newFinalState = [...newFinalState, initStates]
        }
        let dataShow = {
            states: states,
            links: transitionFunctionToLinks(nfaTransition),
            final_states: newFinalState
        }
        setDataShowNfa(dataShow)
        setShowLoader(false)
    }

    const [showLoader, setShowLoader] = useState(false)

    useEffect(() => {
        if (nodes[0]) {
            setInitStates(nodes[0].id)
        }
    }, [nodes])

    useEffect(() => {
        let states = nodes.map(node => {
            return node.id
        })
        let alphabets = []
        if (links) {
            links.forEach(link => {
                if (!alphabets.includes(link.label) && link.label) {
                    alphabets.push(link.label)
                }
            })
        }
        let transition_function = listLinkToTransitionFunctionForNFA(states, links)
        let nfa = {
            states: states,
            initial_state: initStates,
            final_states: finalStates,
            alphabets: alphabets,
            transition_function: transition_function
        }
        setNfa(nfa)
    }, [nodes, links, initStates, finalStates])
    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'NFAε to NFA'
        })
        let leftElement = document.querySelector(`.${styles.left}`)
        if (leftElement) {
            setWidthSvg(leftElement.clientWidth)
            setHeightSvg(window.innerHeight - 150)
        }
    }, [])
    const [nodeAfterRead, setNodeAfterRead] = useState([])

    const copyData = () => {
        console.log('copy')
    }
    const pasteData = () => {
        let nfaEpsilon = JSON.parse(localStorage.getItem('dataNfaEpsilon'))
        console.log(nfaEpsilon)

        if (nfaEpsilon) {
            let newLinks = nfaEpsilon.links.map(link => {
                let newLink = {
                    index: link.index,
                    label: link.label == 'ε' ? '$' : link.label,
                    source: link.source.id,
                    target: link.target.id
                }
                return newLink
            })
            setLinks(newLinks)
            setNodes(nfaEpsilon.nodes)
            setFinalStates(nfaEpsilon.data.final_states)
            setInitStates(nfaEpsilon.data.initial_state)
        }
    }
    return (
        <>
            <Header />
            {
                showLoader && <Loader />
            }
            <div className={styles.nfaEpsilonToNfa}>
                <div className={styles.left}>
                    <ToolDraw
                        widthSvg={widthSvg}
                        heightSvg={heightSvg}
                        mode={mode}
                        nodes={nodes}
                        setNodes={setNodes}
                        linkLength={linkLength}
                        links={links}
                        setLinks={setLinks}
                        radiusCircle={radiusCircle}
                        finalStates={finalStates}
                        setFinalStates={setFinalStates}
                        initStates={initStates}
                        setInitStates={setInitStates}
                        nodeAfterRead={nodeAfterRead}
                    />
                    <div id='parentSvgDrawNfa'>
                        {
                            dataShowNfa && <ToolDisplay
                                data={dataShowNfa}
                                widthSvg={widthSvg}
                                heightSvg={heightSvg}
                                linkLength={linkLength}
                                radiusCircle={radiusCircle}
                            />}
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.mode}>
                        <button className={mode === 0 ? styles.selectMode : ''} onClick={() => { setMode(0) }}>Force</button>
                        <button className={mode === 1 ? styles.selectMode : ''} onClick={() => { setMode(1) }}>Draw</button>
                        <button className={mode === 2 ? styles.selectMode : ''} onClick={() => { setMode(2) }}>Delete</button>
                        <button className={mode === 3 ? styles.selectMode : ''} onClick={() => { setMode(3) }}>Edit</button>
                        {/* <button className={styles.convertButton} >Instruction</button> */}
                    </div>
                    <div>
                        {mode == 0 && <IntroduceForce />}
                        {mode == 1 && <IntroduceDraw />}
                        {mode == 2 && <IntroduceDelete />}
                        {mode == 3 && <IntroduceEdit />}
                    </div>
                    <div>
                        <button className={styles.convertButton} onClick={handleSubmit}>convert</button>
                    </div>
                    {/* <div>
                        <button className={styles.convertButton} onClick={copyData}>Copy</button>
                    </div>
                    <div>
                        <button className={styles.convertButton} onClick={pasteData}>Paste</button>
                    </div> */}
                    <div>
                        <ToolRead
                            automata={nfa}
                            typeAutomata={'nfaEpsilon'}
                            setNodeAfterRead={setNodeAfterRead}
                        />
                    </div>
                </div>
            </div >
        </>
    )
}

export default NfaEpsilon2Nfa;