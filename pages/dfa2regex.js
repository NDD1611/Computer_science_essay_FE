
import styles from './dfa2regex.module.scss'
import { useEffect, useState } from 'react';
import api from '../api';
import Header from '../component/header';
import { useDispatch } from 'react-redux';
import headerActions from '../redux/action/headerActions';
import Loader from '../component/Loader';
import ToolDraw from '../component/toolDraw';
import ToolRead from '../component/toolRead';
import { ExplainMode } from '../component/ExplainModes/ExplainMode';

const Dfa2Regex = () => {
    const [mode, setMode] = useState(0) // 0: force, 1: draw, 2: delete, 3: edit
    const [nodes, setNodes] = useState([])
    const [linkLength, setLinkLength] = useState(200)
    const [links, setLinks] = useState([])
    const [widthSvg, setWidthSvg] = useState(800)
    const [heightSvg, setHeightSvg] = useState(400)
    const [radiusCircle, setRadiusCircle] = useState(30)
    const [finalStates, setFinalStates] = useState([])
    const [initStates, setInitStates] = useState('')
    const [regex, setRegex] = useState('')
    const [nodeAfterRead, setNodeAfterRead] = useState([])
    const [dfa, setDfa] = useState({})
    const [showLoader, setShowLoader] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        if (nodes[0]) {
            setInitStates(nodes[0].id)
        }
    }, [nodes])
    useEffect(() => {

        // check node read one alphabet for many link
        for (let i = 0; i < links.length - 1; i++) {
            let link1 = links[i]
            for (let j = i + 1; j < links.length; j++) {
                let link2 = links[j]
                if (link1.source.id === link2.source.id
                    && link1.label === link2.label
                    && link1.label != ''
                    && link2.label != '') {
                    alert(`Symbol ${link2.label} has transitioned from state ${link1.source.label}.`)
                    link2.label = ''
                    link1.label = ''
                }
            }
        }


        let states = nodes.map(node => {
            return node.id
        })
        states.push('phi')
        let alphabets = []
        if (links) {
            links.forEach(link => {
                if (link.label) {
                    let listAlphabets = link.label.split(',')
                    if (listAlphabets) {
                        listAlphabets.forEach(alpha => {
                            if (!alphabets.includes(alpha) && alpha) {
                                alphabets.push(alpha)
                            }
                        })
                    }
                }
            })
        }
        let transition_function = listLinkToTransitionFunctionForDfa(states)

        let dfa = {
            states: states,
            initial_state: initStates,
            final_states: finalStates,
            alphabets: alphabets,
            transition_function: transition_function,
            reachable_states: states,
            final_reachable_states: finalStates,
        }
        let phi = {}
        for (let key of dfa.alphabets) {
            phi[key] = 'phi'
        }
        dfa.transition_function.phi = phi
        const removeNullDfa = (dfa) => {
            let newDfa = dfa
            for (let key in newDfa['transition_function']) {
                let node = newDfa['transition_function'][key]
                for (let alphabets in node) {
                    if (node[alphabets] === '') {
                        node[alphabets] = 'phi'
                    }
                }
            }
            return newDfa
        }
        let newDfa = removeNullDfa(dfa)
        setDfa(newDfa)
        // check linkLabel have $
        if (links) {
            links.forEach(link => {
                if (link && link.label === '$') {
                    link.label = ''
                    alert('Dfa does not contain the $ character')
                }
            })
        }
    }, [nodes, links, initStates, finalStates])

    let listLinkToTransitionFunctionForDfa = (states) => {
        let transition_function = {}
        if (states) {
            states.forEach(state => {
                transition_function[state] = {}
                if (links) {
                    links.forEach(link => {
                        if (link.label) {
                            let listAlphabets = link.label.split(',')
                            if (listAlphabets) {
                                listAlphabets.forEach(alpha => {
                                    transition_function[state][alpha] = ''
                                })
                            }
                        }
                    })
                    links.forEach(link => {
                        if (link && link.source.id && link.label) {
                            let sourceId = link.source.id
                            let listAlphabets = link.label.split(',')
                            if (sourceId === state && listAlphabets) {
                                let targetId = link.target.id
                                listAlphabets.forEach(alpha => {
                                    if (!transition_function[state][alpha].includes(targetId)) {
                                        transition_function[state][alpha] = targetId
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
        return transition_function
    }

    let handleSubmit = async () => {
        if (finalStates.length !== 0) {
            setShowLoader(true)
            let response = await api.dfa2regex(dfa)
            if (response.err) {
                console.log(response)
            } else {
                let { regex } = response.data
                setRegex(regex)
            }
            setShowLoader(false)
        } else {
            alert('You have not selected an end state.')
        }
    }

    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'DFA to Regex'
        })
        dispatch({
            type: headerActions.SET_SELECT_HEADER,
            headerSelect: 'dfa2regex'
        })
        let leftElement = document.querySelector(`.${styles.left}`)
        if (leftElement) {
            setWidthSvg(leftElement.clientWidth)
            setHeightSvg(window.innerHeight - 150)
        }
    }, [])

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
                        typeAutomata={'dfa'}
                    />
                </div>
                <div className={styles.right}>
                    <ExplainMode
                        mode={mode}
                        setMode={setMode}
                    />
                    <div>
                        <button className={styles.convertButton} onClick={handleSubmit}>convert</button>
                    </div>
                    <div>Regular expression:</div>
                    <div className={styles.regex}>
                        {regex}
                    </div>
                    <div>
                        <ToolRead
                            setNodeAfterRead={setNodeAfterRead}
                            automata={dfa}
                            typeAutomata={'dfa'}
                        />
                    </div>
                </div>
            </div >
        </>
    )
}

export default Dfa2Regex;