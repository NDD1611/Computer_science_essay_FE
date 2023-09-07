
import { useEffect, useState } from "react";
// import { data } from '../data'
import './regex2nfa.module.scss'
import { select, forceSimulation, forceLink, forceManyBody, forceCenter, selectAll, pointer, drag, forceX, forceY } from "d3";
import {
    progressOneNode, transition_function, checkLinkTrungNhau, findVectors, findShadowOfPointFromVector
} from '../utils/commonFunctions'

import api from '../api'
const Regex2Dfa = () => {

    const [force, setForce] = useState(false)
    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50)
    const [linkLength, setLinkLength] = useState(200)
    const [radiusCircle, setRadiusCircle] = useState(30)

    const [data, setData] = useState()
    const [widthSvg, setWidthSvg] = useState(600)
    const [heightSvg, setHeightSvg] = useState(600)
    const [nodes, setNodes] = useState()
    const [states, setStates] = useState()
    const [links, setLinks] = useState()
    const [regex, setRegex] = useState('01*+1')
    const [nfa, setNfa] = useState()

    let handleConvertRegex2Nfa = async () => {
        //post regex
        let response = await api.regex2nfa(regex)

        if (!response.err) {
            let data = response.data
            console.log(data)
            setData(data)
            setNfa(data)
            setWidthSvg(window.innerWidth - 50)
            setHeightSvg(window.innerHeight - 200)
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
            console.log(links, '=========')
            setLinks(links)
        }

    }


    useEffect(() => {
        let simulation = null
        if (nodes && states && links) {
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
                .attr("marker-end", "url(#arrow)") // Thêm mũi tên


            //  Vẽ các mũi tên
            svg.append("defs").selectAll("marker")
                .data(["arrow"]) // Tên mũi tên
                .enter().append("marker")
                .attr("id", d => d)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 35) // Vị trí của mũi tên
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
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
                .text(d => "q" + d.label);

            simulation = forceSimulation(nodes)
                .force("link", forceLink(links).id(d => d.id).distance(linkLength))
                .force("center", forceCenter(svg.attr("width") / 2, svg.attr("height") / 2))
                .force("charge", forceManyBody().strength(-50))


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

                        return `M ${sourceX} ${sourceY} C ${pointControlX} ${pointControlY}, ${pointControlX} ${pointControlY}, ${targetX} ${targetY}`
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
                                return labelX
                            }
                        }
                        let labelX = ((d.source.x + d.target.x) / 2)
                        if (labelX < leftThreshold) {
                            labelX = leftThreshold
                        }
                        if (labelX > rightThreshold) {
                            labelX = rightThreshold
                        }
                        return labelX
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
                                return labelY
                            }
                        }
                        let labelY = ((d.source.y + d.target.y) / 2)
                        if (labelY < topThreshold) {
                            labelY = topThreshold
                        }
                        if (labelY > bottomThreshold) {
                            labelY = bottomThreshold
                        }
                        return labelY
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

    let handleForce = () => {
        setLinkLength(linkLength + 50)
    }

    let handleDraw = () => {
        setLinkLength(linkLength - 50)
    }
    let handleInputLinkLength = (e) => {
        setLinkLength(e.target.value)
    }
    let handleInputRadiusCircle = (e) => {
        setRadiusCircle(e.target.value)
    }

    let handleChangeInputRegex = (e) => {
        setRegex(e.target.value)
    }

    let handleShowDFA = async () => {
        let response = await api.nfa2dfa(nfa)
        console.log(response)
    }


    return (
        <div >
            <div>
                {/* <button onClick={handleForce}>force</button> */}
                <button onClick={handleShowDFA}>console.log DFA</button>
                <div>
                    <label>Nhập biểu thức chính quy:</label>
                    <input
                        type="text"
                        value={regex}
                        onChange={(e) => { handleChangeInputRegex(e) }}
                    />
                    <button
                        onClick={handleConvertRegex2Nfa}
                    >Chuyển đổi</button>
                </div>
                <div>
                    <label>Edge length:</label>
                    <input
                        type="number" step='10'
                        value={linkLength}
                        onChange={(e) => { handleInputLinkLength(e) }}
                        min={50}
                        max={300}
                    ></input>
                </div>
                <div>
                    <label>circle radius:</label>
                    <input
                        type="number" step='1'
                        value={radiusCircle}
                        onChange={(e) => { handleInputRadiusCircle(e) }}
                        min={15}
                        max={40}
                    ></input>
                </div>
            </div>
            <div id="parentSvg">
                {/* <svg className='MySvg' id="myCanvas" width={widthSvg} height={heightSvg}></svg> */}
            </div>
        </div>
    )
}

export default Regex2Dfa;