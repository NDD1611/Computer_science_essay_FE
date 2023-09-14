
import styles from './nfa2dfa.module.scss'
import { use, useEffect, useState } from 'react';
import { select, forceSimulation, forceLink, forceManyBody, forceCenter, selectAll, pointer, drag, forceX, forceY, dsvFormat } from "d3";
import { checkLinkTrungNhau, findVectors } from '../utils/commonFunctions'
import { v4 as uuidv4 } from 'uuid';
import api from '@/api';
import { Oval } from 'react-loader-spinner'
import Header from '@/component/header';
import { useDispatch } from 'react-redux';
import headerActions from '@/redux/action/headerActions';
const Dfa2Regex = () => {
    const [mode, setMode] = useState(0) // 0: force, 1: draw, 2: delete, 3: edit
    const [subMode, setSubMode] = useState('0')  //0:init no function, 1.0: draging link
    const [nodes, setNodes] = useState([])
    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50)
    const [linkLength, setLinkLength] = useState(200)
    const [links, setLinks] = useState([])
    const [widthSvg, setWidthSvg] = useState(800)
    const [heightSvg, setHeightSvg] = useState(400)
    const [radiusCircle, setRadiusCircle] = useState(30)
    const [linkFromId, setLinkFromId] = useState()
    const [finalStates, setFinalStates] = useState([])
    const [initStates, setInitStates] = useState('')
    const [regex, setRegex] = useState('')
    const [showLoader, setShowLoader] = useState(false)
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch({
            type: headerActions.SET_SELECT_HEADER,
            headerSelect: 'dfa2regex'
        })
        // setWidthSvg(window.innerWidth)
        setHeightSvg(window.innerHeight - 100)
        let simulation = null
        // if (nodes && states && links) {
        select('#parentSvg').append('svg')
            .attr('id', 'myCanvas')
            .attr('width', widthSvg)
            .attr('height', heightSvg)

        let listLinkTrung = checkLinkTrungNhau(links)

        // Tạo SVG
        let svg = select("#myCanvas");

        //  Vẽ các liên kết
        let link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("source", d => d.source.id)
            .attr("target", d => d.target.id)
            .attr("marker-end", "url(#arrow)") // Thêm mũi tên


        //  Vẽ các mũi tên
        svg.append("defs").selectAll("marker")
            .data(["arrow"]) // Tên mũi tên
            .enter().append("marker")
            .attr("id", d => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 30) // Vị trí của mũi tên
            .attr("refY", 0)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");

        // Vẽ các nhãn
        let linkLabels = svg.selectAll(".link-label")
            .data(links)
            .enter().append("text")
            .attr("class", "link-label")
            .text(d => d.label);

        //  Vẽ các đỉnh
        let node = svg.selectAll(".node")
            .data(nodes)
            .enter().append('circle')
            .attr("class", "node")
            .attr("r", radiusCircle)
            .attr('id', d => d.id)

        //  Vẽ văn bản trong các node
        let nodeLabels = svg.selectAll(".node-label")
            .data(nodes)
            .enter().append("text")
            .attr("class", "node-label")
            .attr("dy", 5) // Vị trí theo trục y
            .style("text-anchor", "middle")
            .text(d => d.label);

        if (mode === 0) {
            simulation = forceSimulation(nodes)
                .force("link", forceLink(links).id(d => d.id).distance(linkLength))
                .force("center", forceCenter(svg.attr("width") / 2, svg.attr("height") / 2))
                .force("charge", forceManyBody().strength(-50))
        } else {
            simulation = forceSimulation(nodes)
                .force("link", forceLink(links).id(d => d.id).distance(linkLength))
            // .force("center", forceCenter(svg.attr("width") / 2, svg.attr("height") / 2))
            // .force("charge", forceManyBody().strength(-50))
        }

        // // Thiết lập vị trí ban đầu và cập nhật vị trí sau mỗi bước mô phỏng
        simulation.on("tick", () => {
            link
                .attr('d', d => {
                    let vectors = findVectors(d.source.x, d.source.y, d.target.x, d.target.y)

                    let percentEdge = vectors.length / lengthDistanceEdge

                    let pointCenterX = (d.source.x + d.target.x) / 2
                    let pointCenterY = (d.source.y + d.target.y) / 2

                    let pointControlX = pointCenterX
                    let pointControlY = pointCenterY
                    for (let i = 0; i < listLinkTrung.length; i++) {
                        let { link1, link2 } = listLinkTrung[i]
                        if (d === link1 || d === link2) {
                            pointControlX = pointCenterX + (vectors.vtpt.x / percentEdge)
                            pointControlY = pointCenterY + (vectors.vtpt.y / percentEdge)
                        }
                    }

                    let sourceX = d.source.x
                    let sourceY = d.source.y
                    let targetX = d.target.x
                    let targetY = d.target.y

                    let leftThreshold = 0 + radiusCircle
                    let rightThreshold = widthSvg - radiusCircle
                    let topThreshold = 0 + radiusCircle
                    let bottomThreshold = heightSvg - radiusCircle

                    if (pointControlX < leftThreshold) {
                        pointControlX = leftThreshold
                    }
                    if (pointControlX > rightThreshold) {
                        pointControlX = rightThreshold
                    }
                    if (pointControlY < topThreshold) {
                        pointControlY = topThreshold
                    }
                    if (pointControlY > bottomThreshold) {
                        pointControlY = bottomThreshold
                    }

                    if (d.source.x < leftThreshold) {
                        sourceX = leftThreshold
                    }
                    if (d.source.x > rightThreshold) {
                        sourceX = rightThreshold
                    }
                    if (d.source.y < topThreshold) {
                        sourceY = topThreshold
                    }
                    if (d.source.y > bottomThreshold) {
                        sourceY = bottomThreshold
                    }

                    if (d.target.x < leftThreshold) {
                        targetX = leftThreshold
                    }
                    if (d.target.x > rightThreshold) {
                        targetX = rightThreshold
                    }
                    if (d.target.y < topThreshold) {
                        targetY = topThreshold
                    }
                    if (d.target.y > bottomThreshold) {
                        targetY = bottomThreshold
                    }

                    // vẽ path cho 1 node có source trùng target
                    if (d.source.id === d.target.id) {
                        return `M ${sourceX - radiusCircle} ${sourceY} C ${sourceX - radiusCircle} ${sourceY - radiusCircle * 4}, ${sourceX + radiusCircle} ${sourceY - radiusCircle * 4}, ${targetX + radiusCircle} ${targetY}`
                    }

                    if (pointControlX && pointControlY) {
                        return `M ${sourceX} ${sourceY} C ${pointControlX} ${pointControlY}, ${pointControlX} ${pointControlY}, ${targetX} ${targetY}`
                    }
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
                    let leftThreshold = 0 + radiusCircle
                    let rightThreshold = widthSvg - radiusCircle
                    for (let i = 0; i < listLinkTrung.length; i++) {
                        let { link1, link2 } = listLinkTrung[i]
                        if (d === link1 || d === link2) {
                            let vectors = findVectors(d.source.x, d.source.y, d.target.x, d.target.y)
                            let percentEdge = vectors.length / lengthDistanceEdge
                            let labelX = ((d.source.x + d.target.x) / 2) + (vectors.vtpt.x / percentEdge)
                            if (labelX < leftThreshold) {
                                labelX = leftThreshold
                            }
                            if (labelX > rightThreshold) {
                                labelX = rightThreshold
                            }
                            if (labelX) {
                                return labelX
                            }
                        }
                    }
                    let labelX = ((d.source.x + d.target.x) / 2)
                    if (labelX < leftThreshold) {
                        labelX = leftThreshold
                    }
                    if (labelX > rightThreshold) {
                        labelX = rightThreshold
                    }
                    // xac dinh vi tri x cho link labe  co source trung target
                    if (d.source.id === d.target.id) {
                        return d.source.x
                    }
                    if (labelX) {
                        return labelX
                    }

                })
                .attr("y", d => {
                    let topThreshold = 0 + radiusCircle
                    let bottomThreshold = heightSvg - radiusCircle
                    for (let i = 0; i < listLinkTrung.length; i++) {
                        let { link1, link2 } = listLinkTrung[i]
                        if (d === link1 || d === link2) {
                            let vectors = findVectors(d.source.x, d.source.y, d.target.x, d.target.y)
                            let percentEdge = vectors.length / lengthDistanceEdge
                            let labelY = ((d.source.y + d.target.y) / 2) + (vectors.vtpt.y / percentEdge)
                            if (labelY < topThreshold) {
                                labelY = topThreshold
                            }
                            if (labelY > bottomThreshold) {
                                labelY = bottomThreshold
                            }
                            if (labelY) {
                                return labelY
                            }
                        }
                    }
                    let labelY = ((d.source.y + d.target.y) / 2)
                    if (labelY < topThreshold) {
                        labelY = topThreshold
                    }
                    if (labelY > bottomThreshold) {
                        labelY = bottomThreshold
                    }
                    // xac dinh vi tri y cua link label co source trung target
                    if (d.source.id === d.target.id) {
                        return d.source.y - radiusCircle * 3
                    }
                    if (labelY) {
                        return labelY
                    }
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

        // Kích hoạt tính năng kéo thả cho các node
        node.call(dragCustom(simulation));

        if (finalStates) {
            finalStates.forEach(finalId => {
                node.filter(d => d.id === finalId)
                    .classed("final-border", true);
            })
        }
        node.filter(d => d.id === initStates)
            .classed("start-border", true);

        return () => {
            select('#myCanvas').remove()
        }
        // end effect
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

    let handleAddNode = (e) => {
        let offsetX = e.offsetX
        let offsetY = e.offsetY
        let node = {
            x: offsetX,
            y: offsetY,
            label: nodes.length,
            id: uuidv4()
        }

        let newNodes = [...nodes, node]
        setNodes(newNodes)
    }
    let handleDeleteNode = (e) => {
        let id = e.target.id

        //delete links
        let linksCopy1 = links.filter((link) => {
            return link.source.id != id
        })
        let linksCopy = linksCopy1.filter((link) => {
            return link.target.id != id
        })
        let nodesCopy = [...nodes]
        for (let index in nodesCopy) {
            let node = nodesCopy[index]
            if (node.id === id) {
                nodesCopy.splice(index, 1)
                // update label
                for (let i = index; i < nodesCopy.length; i++) {
                    nodesCopy[i].label = i
                }
            }
        }
        let final_state_copy = finalStates
        if (finalStates.includes(id)) {
            let index = finalStates.indexOf(id)
            final_state_copy.splice(index, 1)
            setFinalStates(final_state_copy)
        }
        setNodes(nodesCopy)
        setLinks(linksCopy)
    }

    let handleMoveMouseAddLink = (e) => {
        let endX = e.offsetX
        let endY = e.offsetY
        if (linkFromId) {
            let nodeStart = document.getElementById(linkFromId)
            let startX = nodeStart.getAttribute('cx')
            let startY = nodeStart.getAttribute('cy')
            let svg = document.getElementById('myCanvas')
            let lineElement = document.createElementNS("http://www.w3.org/2000/svg", 'line')
            lineElement.setAttribute('x1', startX)
            lineElement.setAttribute('x2', endX)
            lineElement.setAttribute('y1', startY)
            lineElement.setAttribute('y2', endY)
            lineElement.setAttribute('class', 'lineRemove')
            let lineRemove = document.querySelectorAll('.lineRemove')
            if (lineRemove) {
                lineRemove.forEach(line => {
                    line.remove();
                });
            }
            svg.insertBefore(lineElement, svg.firstChild);
        }
    }
    let handleStartAddLink = (e) => {
        e.stopPropagation()
        setLinkFromId(e.target.id)
        setSubMode('1.0')
    }

    let handleClickSvg = (e) => {
        if (mode === 1 && subMode === '0') {
            handleAddNode(e)
        }
        if (e.target.nodeName !== 'circle' && subMode === '1.0') {
            setLinkFromId(null)
            setSubMode('0')
        }
    }

    let handleAddLink = (e) => {
        if (linkFromId && e.target.id) {
            let newLinks = {
                source: linkFromId,
                target: e.target.id
            }
            setLinks([
                ...links,
                newLinks
            ])
        }

    }

    let handleNodeClick = (e) => {
        if (mode === 1) {
            handleStartAddLink(e)
        }
        if (mode === 2) {
            handleDeleteNode(e)
        }
        if (mode === 1 && subMode === '1.0') {
            handleAddLink(e)
        }
    }
    let handlePathClick = (e) => {
        if (mode === 2) {
            let sourceId = e.target.getAttribute('source')
            let targetId = e.target.getAttribute('target')
            let newLinks = links.filter(link => !(link.source.id == sourceId && link.target.id == targetId))
            setLinks(newLinks)
        }
        if (mode === 3) {
            e.stopPropagation()
            const inputBox = document.createElement("input");
            inputBox.type = "text";
            inputBox.style.position = "absolute";
            inputBox.style.width = "30px";
            inputBox.style.className = "removeInput";
            inputBox.style.left = e.clientX + "px";
            inputBox.style.top = e.clientY + "px";

            document.body.appendChild(inputBox);

            inputBox.focus();

            let sourceId = e.target.getAttribute('source')
            let targetId = e.target.getAttribute('target')

            inputBox.addEventListener('change', (eventInput) => {
                let value = eventInput.target.value
                let newLinks = links.map(link => {
                    if (link.source.id === sourceId && link.target.id === targetId) {
                        link.label = value
                        return link
                    }
                    return link
                })
                setLinks(newLinks)
                inputBox.remove()
            })
        }
    }

    useEffect(() => {
        let svg = document.getElementById('myCanvas')
        svg.addEventListener('mousemove', handleMoveMouseAddLink)

        let circles = document.querySelectorAll('circle')
        if (circles) {
            circles.forEach(circle => {
                circle.addEventListener('click', handleNodeClick)
            })
            circles.forEach(circle => {
                circle.addEventListener('dblclick', (e) => {
                    if (mode === 3) {
                        let nodeId = e.target.id
                        if (nodeId != initStates) {
                            let check = finalStates.includes(nodeId)
                            if (check) {
                                let newFinalStates = finalStates.filter(state => {
                                    return state != nodeId
                                })
                                setFinalStates(newFinalStates)
                            } else {
                                let newFinalStates = [
                                    ...finalStates,
                                    nodeId
                                ]
                                setFinalStates(newFinalStates)
                            }
                        }
                    }
                })
            })
        }

        let paths = document.querySelectorAll('path')
        if (paths) {
            paths.forEach(path => {
                path.addEventListener('click', handlePathClick)
            })
        }

        if (svg) {
            svg.addEventListener('click', handleClickSvg)
        }
        return () => {
            if (svg) {
                svg.removeEventListener('mousemove', handleMoveMouseAddLink)
            }
        }
    })
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

    return (
        <div>
            <Header />
            {
                showLoader &&
                <div className={styles.loader}>
                    <div className={styles.backgroundLoader}></div>
                    <div className={styles.loaderContainer}>
                        <Oval
                            height={80}
                            width={80}
                            color="#4fa94d"
                            wrapperStyle={{}}
                            wrapperClass="Loader"
                            visible={true}
                            ariaLabel='oval-loading'
                            secondaryColor="#4fa94d"
                            strokeWidth={2}
                            strokeWidthSecondary={2}
                        />
                    </div>
                </div>
            }
            <div> Dfa To Regex
                <button onClick={handleSubmit}>submit</button>
            </div>
            <div>
                Regex: {regex}
            </div>
            <div>
                <button className={mode === 0 ? styles.selectMode : ''} onClick={() => { setMode(0) }}>force</button>
                <button className={mode === 1 ? styles.selectMode : ''} onClick={() => { setMode(1) }}>draw</button>
                <button className={mode === 2 ? styles.selectMode : ''} onClick={() => { setMode(2) }}>delete</button>
                <button className={mode === 3 ? styles.selectMode : ''} onClick={() => { setMode(3) }}>edit</button>
            </div>
            <div id='parentSvg'>
                {/* <svg id='myCanvas' width='600' height='600'></svg> */}
            </div>
        </div >
    )
}

export default Dfa2Regex;