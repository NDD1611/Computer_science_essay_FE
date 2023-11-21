
import { useEffect, useState } from "react";
import './regex2nfa.module.scss'
import { select, forceSimulation, forceLink, forceManyBody, forceCenter, drag } from "d3";
import {
    evaluateOfLinkLabelX, evaluateOfLinkLabelY, pathLink, transition_function, checkForDuplicatePath
} from '../utils/commonFunctions'

import api from '../api'
import styles from './regex2nfa.module.scss'
import Header from "../component/header";
import { useDispatch } from "react-redux";
import headerActions from "../redux/action/headerActions";
import Loader from "../component/Loader";

const Regex2Dfa = () => {

    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50)
    const [linkLength, setLinkLength] = useState(200)
    const [radiusCircle, setRadiusCircle] = useState(30)

    const [data, setData] = useState()
    const [widthSvg, setWidthSvg] = useState(600)
    const [heightSvg, setHeightSvg] = useState(600)
    const [nodes, setNodes] = useState()
    const [states, setStates] = useState()
    const [links, setLinks] = useState()
    const [regex, setRegex] = useState('')
    const [nfa, setNfa] = useState()
    const [showLoader, setShowLoader] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch({
            type: headerActions.SET_SELECT_HEADER,
            headerSelect: 'regex2nfa'
        })
        let mainElement = document.querySelector(`.${styles.regex2dfa}`)
        if (mainElement) {
            setWidthSvg(mainElement.clientWidth)
            setHeightSvg(window.innerHeight - 200)
        }

        let simulation = null
        if (nodes && states && links) {
            select('#parentSvg').append('svg')
                .attr('id', 'myCanvas')
                .attr('width', widthSvg)
                .attr('height', heightSvg)

            let listLinkTrung = checkForDuplicatePath(links)

            let svg = select("#myCanvas");

            let link = svg.selectAll(".link")
                .data(links)
                .enter().append("path")
                .attr("class", "link")
                .attr("marker-end", "url(#arrow)")


            svg.append("defs").selectAll("marker")
                .data(["arrow"])
                .enter().append("marker")
                .attr("id", d => d)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", radiusCircle)
                .attr("refY", 0)
                .attr("markerWidth", 5)
                .attr("markerHeight", 5)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5");

            let linkLabels = svg.selectAll(".link-label")
                .data(links)
                .enter().append("text")
                .attr("class", "link-label")
                .text(d => d.label);

            let node = svg.selectAll(".node")
                .data(nodes)
                .enter().append('circle')
                .attr("class", "node")
                .attr("r", radiusCircle)
                .attr('id', d => d.id)


            let nodeLabels = svg.selectAll(".node-label")
                .data(nodes)
                .enter().append("text")
                .attr("class", "node-label")
                .attr("dy", 5)
                .style("text-anchor", "middle")
                .text(d => "q" + d.label);

            simulation = forceSimulation(nodes)
                .force("link", forceLink(links).id(d => d.id).distance(linkLength))
                .force("center", forceCenter(svg.attr("width") / 2, svg.attr("height") / 2))
                .force("charge", forceManyBody().strength(-50))

            simulation.on("tick", () => {
                link
                    .attr('d', d => {
                        let path = pathLink(d, widthSvg, heightSvg, radiusCircle, lengthDistanceEdge, listLinkTrung)
                        return path
                    })

                node
                    .attr("cx", d => {
                        let leftThreshold = 0 + radiusCircle
                        if (d.x < leftThreshold) {
                            return leftThreshold
                        }
                        let rightThreshold = widthSvg - radiusCircle
                        if (d.x > rightThreshold) {
                            return rightThreshold
                        }
                        return d.x

                    })
                    .attr("cy", d => {
                        let topThreshold = 0 + radiusCircle
                        if (d.y < topThreshold) {
                            return topThreshold
                        }
                        let bottomThreshold = heightSvg - radiusCircle
                        if (d.y > bottomThreshold) {
                            return bottomThreshold
                        }
                        return d.y
                    });

                linkLabels
                    .attr("x", d => {
                        let x = evaluateOfLinkLabelX(d, widthSvg, radiusCircle, lengthDistanceEdge, listLinkTrung)
                        return x
                    })
                    .attr("y", d => {
                        let y = evaluateOfLinkLabelY(d, heightSvg, radiusCircle, lengthDistanceEdge, listLinkTrung)
                        return y
                    });

                nodeLabels
                    .attr("x", d => {
                        let leftThreshold = 0 + radiusCircle
                        if (d.x < leftThreshold) {
                            return leftThreshold
                        }
                        let rightThreshold = widthSvg - radiusCircle
                        if (d.x > rightThreshold) {
                            return rightThreshold
                        }
                        return d.x
                    })
                    .attr("y", d => {
                        let topThreshold = 0 + radiusCircle
                        if (d.y < topThreshold) {
                            return topThreshold
                        }
                        let bottomThreshold = heightSvg - radiusCircle
                        if (d.y > bottomThreshold) {
                            return bottomThreshold
                        }
                        return d.y
                    });
            });

            node.call(dragCustom(simulation));
            node.on('click', (event) => {
                console.log(event.target)
            })

            if (data.final_states) {
                data.final_states.forEach(finalId => {
                    node.filter(d => d.id === finalId)
                        .classed("final-border", true);
                })
            }
            node.filter(d => d.id === data.initial_state)
                .classed("start-border", true);

        }

        return () => {
            select('#myCanvas').remove()
        }
    })

    let dragCustom = (simulation) => {
        function dragStarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragEnded(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);
    }

    let handleChangeInputRegex = (e) => {
        setRegex(e.target.value)
    }

    let handleConvertRegex2Nfa = async () => {
        if (regex) {
            setShowLoader(true)
            let response = await api.regex2nfa(regex)
            if (!response.err) {
                let data = response.data
                setData(data)
                setNfa(data)
                setStates(data.states)
                let newState = data.states.map(((state, index) => {
                    let newState = {
                        id: state,
                        label: index.toString()
                    }
                    return newState
                }))
                setNodes(newState)
                let links = transition_function(data.transition_function)
                setLinks(links)
                setShowLoader(false)
            }
        } else {
            alert('Please enter regular expression')
        }
    }

    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'Regex to NFA'
        })
    }, [])

    return (
        <>
            <Header />
            <div className={styles.regex2dfa}>
                {
                    showLoader &&
                    <Loader />
                }
                <div>
                    <div className={styles.inputData}>
                        <div className={styles.inputDataTop}>
                            <label>Regex: </label>
                            <input
                                type="text"
                                value={regex}
                                onChange={(e) => { handleChangeInputRegex(e) }}
                                placeholder="01*"
                            />
                        </div>
                        <div className={styles.inputDataBottom}>
                            <button
                                onClick={handleConvertRegex2Nfa} >
                                Convert
                            </button>
                        </div>
                    </div>
                </div>
                <div id="parentSvg">
                    <svg className={styles.svgNfa} id="myCanvas" width={widthSvg} height={heightSvg}></svg>
                </div>
            </div>

        </>
    )
}

export default Regex2Dfa;