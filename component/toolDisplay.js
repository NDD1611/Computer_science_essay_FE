import { useEffect, useState } from "react";
import {
    select, forceSimulation, forceLink, forceManyBody, forceCenter, drag
} from "d3";
import { checkLinkTrungNhau, pathLink, evaluateOfLinkLabelX, evaluateOfLinkLabelY } from '../utils/commonFunctions'

const ToolDisplay = ({ data, widthSvg, heightSvg, linkLength, radiusCircle }) => {
    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50)
    const [nodes, setNodes] = useState()
    const [links, setLinks] = useState()
    const [finalState, setFinalState] = useState()

    useEffect(() => {
        try {
            let { final_states, links, states } = data
            // xu ly 2 link trung nhau => label bi chong len nhau
            for (let i = 0; i < links.length - 1; i++) {
                let link1 = links[i]
                for (let j = i + 1; j < links.length; j++) {
                    let link2 = links[j]
                    if (link1.source == link2.source && link1.target == link2.target) {
                        if (link1.label != link2.label) {
                            link1.label = link1.label + ',' + link2.label
                        }
                        links.splice(j, 1)
                        j--
                    }
                }
            }

            let nodes = states.map((state, index) => {
                console.log(state)
                let newState = {
                    id: state,
                    label: index.toString()
                }
                return newState
            })

            console.log(nodes, links, final_states)
            setLinks(links)
            setNodes(nodes)
            setFinalState(final_states)
        } catch (err) {
            console.log(err)
        }

    }, [data])

    useEffect(() => {
        try {
            let simulation = null
            if (nodes && links) {
                select('#canvasDisplay').append('svg')
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
                    .attr("refX", radiusCircle) // Vị trí của mũi tên
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

                // Kích hoạt tính năng kéo thả cho các node
                node.call(dragCustom(simulation));

                if (finalState) {
                    finalState.forEach(finalId => {
                        node.filter(d => d.id === finalId)
                            .classed("final-border", true);
                    })
                }
            }

        } catch (err) {
            console.log(err)
        }

        return () => {
            select('#canvasDrawDfa').remove()
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

    return (
        <div >
            <div id='canvasDisplay'>
                {/* <svg id="canvasDrawDfa" width={widthSvg} height={heightSvg}></svg> */}
            </div>
        </div>
    )
}

export default ToolDisplay;