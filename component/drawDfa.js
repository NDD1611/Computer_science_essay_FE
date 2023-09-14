import { useEffect, useState } from "react";
// import { data } from '../data'
import './drawDfa.module.scss'
import { select, forceSimulation, forceLink, forceManyBody, forceCenter, selectAll, pointer, drag, forceX, forceY } from "d3";
import {
    progressOneNode, transition_function, checkLinkTrungNhau, findVectors, findShadowOfPointFromVector
} from '../utils/commonFunctions'

const DrawDfa = ({ dataShowDfa }) => {
    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50)
    const [linkLength, setLinkLength] = useState(200)
    const [radiusCircle, setRadiusCircle] = useState(30)

    const [widthSvg, setWidthSvg] = useState(600)
    const [heightSvg, setHeightSvg] = useState(600)
    const [nodes, setNodes] = useState()
    const [states, setStates] = useState()
    const [links, setLinks] = useState()
    const [finalState, setFinalState] = useState()

    useEffect(() => {
        setWidthSvg(window.innerWidth)
        setHeightSvg(window.innerHeight)
        let { final_states, links, states } = dataShowDfa
        console.log(dataShowDfa)
        setStates(states)
        setLinks(links)
        setNodes(states)
        setFinalState(final_states)
    }, [dataShowDfa])

    useEffect(() => {
        console.log('drawDfa re render', dataShowDfa)
        let simulation = null
        if (nodes && states && links) {
            console.log(nodes, states, links)
            select('#canvasShowDfa').append('svg')
                .attr('id', 'canvasDrawDfa')
                .attr('width', widthSvg)
                .attr('height', heightSvg)

            let listLinkTrung = checkLinkTrungNhau(links)

            // Tạo SVG
            let svg = select("#canvasDrawDfa");

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
                .text(d => d.label);

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

                        // vẽ path cho 1 node có source trùng target
                        if (d.source.id === d.target.id) {
                            console.log(d.source.id, d.target.id)
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

            if (finalState) {
                finalState.forEach(finalId => {
                    node.filter(d => d.id === finalId)
                        .classed("final-border", true);
                })
            }
        }

        return () => {
            console.log('remove dfa')
            select('#canvasDrawDfa').remove()
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

    let handleInputLinkLength = (e) => {
        setLinkLength(e.target.value)
    }
    let handleInputRadiusCircle = (e) => {
        setRadiusCircle(e.target.value)
    }

    return (
        <div >
            <div onClick={() => {
                select('#canvasDrawDfa').remove()
            }}>DFA</div>
            <div>
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
            <div id='canvasShowDfa'>
                {/* <svg id="canvasDrawDfa" width={widthSvg} height={heightSvg}></svg> */}
            </div>
        </div>
    )
}

export default DrawDfa;