
import styles from './nfa2dfa.module.scss'
import { use, useEffect, useState } from 'react';
import { select, forceSimulation, forceLink, forceManyBody, forceCenter, selectAll, pointer, drag, forceX, forceY, dsvFormat } from "d3";
import {
    evaluateOfLinkLabelX, evaluateOfLinkLabelY, pathLink, checkLinkTrungNhau, findVectors
} from '../utils/commonFunctions'
import { v4 as uuidv4 } from 'uuid';
import api from '@/api';
import { Oval } from 'react-loader-spinner'
import Header from '@/component/header';
import { useDispatch } from 'react-redux';
import headerActions from '@/redux/action/headerActions';
import Loader from '@/component/Loader';
import IntroduceForce from '@/component/introduceForce';
import IntroduceDraw from '@/component/introduceDraw';
import IntroduceDelete from '@/component/introduceDelete';
import IntroduceEdit from '@/component/introduceEdit';
import ToolDraw from '@/component/toolDraw';

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
    const [showLoader, setShowLoader] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        if (nodes[0]) {
            setInitStates(nodes[0].id)
        }
    }, [nodes])

    let listLinkToTransitionFunctionForDfa = (states) => {
        let transition_function = {}
        if (states) {
            states.forEach(state => {
                transition_function[state] = {}
                links.forEach(link => {
                    let listAlphabets = link.label.split(',')
                    listAlphabets.forEach(alpha => {
                        transition_function[state][alpha] = ''
                    })
                })
                links.forEach(link => {
                    let sourceId = link.source.id
                    let alphabets = link.label
                    let listAlphabets = link.label.split(',')
                    if (sourceId === state) {
                        let targetId = link.target.id
                        listAlphabets.forEach(alpha => {
                            if (!transition_function[state][alpha].includes(targetId)) {
                                transition_function[state][alpha] = targetId
                            }
                        })
                    }
                })
            })
        }
        return transition_function
    }

    let handleSubmit = async () => {
        let states = nodes.map(node => {
            return node.id
        })
        states.push('phi')
        let alphabets = []
        if (links) {
            links.forEach(link => {
                let listAlphabets = link.label.split(',')
                listAlphabets.forEach(alpha => {
                    if (!alphabets.includes(alpha) && alpha) {
                        alphabets.push(alpha)
                    }
                })
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
        console.log(dfa)
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
        if (finalStates.length !== 0) {
            setShowLoader(true)
            let response = await api.dfa2regex(newDfa)
            if (response.err) {
                console.log(response)
            } else {
                let { regex } = response.data
                setRegex(regex)
            }
            setShowLoader(false)
        } else {
            alert('Bạn chưa chọn trạng thái kết thúc')
        }
    }

    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'DFA to Regex'
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
                    />
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
                    <div>
                        Regex: {regex}
                    </div>
                </div>
            </div >
        </>
    )
}

export default Dfa2Regex;