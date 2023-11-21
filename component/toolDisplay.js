import { useEffect, useState } from "react";
import {
    select, forceSimulation, forceLink, forceManyBody, forceCenter, drag
} from "d3";
import { checkForDuplicatePath, pathLink, evaluateOfLinkLabelX, evaluateOfLinkLabelY } from '../utils/commonFunctions'
import { getAllLinkFromNodeId } from '../utils/getAllLinkFromNodeId'
const ToolDisplay = ({ data, widthSvg, heightSvg, linkLength, radiusCircle, mode = 3 }) => {
    let nodeDragCurrent = null
    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50)
    const [nodes, setNodes] = useState()
    const [links, setLinks] = useState()
    const [finalState, setFinalState] = useState()
    const [myDragNodeId, setMyDragNodeId] = useState('')

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
                let newState = {
                    id: state,
                    label: index.toString()
                }
                return newState
            })

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

                let listLinkTrung = checkForDuplicatePath(links)

                let svg = select("#canvasDrawDfa");

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
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
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
                    .text(d => d.label);

                simulation = forceSimulation(nodes)
                    .force("link", forceLink(links).id(d => d.id).distance((d) => {
                        if (d.length) {
                            return d.length
                        }
                        return linkLength
                    }))
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

    let handleMoveMouseAddLink = (e) => {
        if ((mode === 3 || mode === 1) && myDragNodeId != '') {
            if (nodes.length) {
                nodes.forEach(node => {
                    if (myDragNodeId == node.id) {
                        nodeDragCurrent = node
                    }
                })
                if (nodeDragCurrent) {
                    let svg = document.getElementById("canvasDrawDfa");
                    let circleElement = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );
                    circleElement.setAttribute("cx", e.offsetX);
                    circleElement.setAttribute("cy", e.offsetY);
                    circleElement.setAttribute("r", 30);
                    circleElement.setAttribute("stroke", 'black');
                    circleElement.setAttribute("stroke-width", 1);
                    circleElement.setAttribute("fill", "none");
                    circleElement.setAttribute("class", "circleRemove");
                    let circleRemove = document.querySelectorAll(".circleRemove");
                    if (circleRemove) {
                        circleRemove.forEach((circle) => {
                            circle.remove();
                        });
                    }


                    let textElement = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "text"
                    );
                    textElement.setAttribute("x", e.offsetX - 5);
                    textElement.setAttribute("y", e.offsetY + 5);
                    textElement.setAttribute("class", "textRemove");
                    textElement.innerHTML = nodeDragCurrent.label
                    let textRemove = document.querySelectorAll(".textRemove");
                    if (textRemove) {
                        textRemove.forEach((text) => {
                            text.remove();
                        });
                    }
                    svg.insertBefore(circleElement, svg.firstChild);
                    svg.insertBefore(textElement, svg.firstChild);
                }
            }
        }
    };
    let handleContextMenuSvg = (e) => {
        e.preventDefault()
        if ((mode === 3 || mode === 1) && myDragNodeId != '') {
            let linkOfNodeId = getAllLinkFromNodeId(nodeDragCurrent.id, links)
            if (linkOfNodeId.length) {
                let indexLinkOfNodeId = linkOfNodeId.map(link => {
                    return link.index
                })
                let copyLinks = [...links]
                copyLinks.forEach(link => {
                    if (indexLinkOfNodeId.includes(link.index)) {
                        if (nodeDragCurrent.id === link.source.id) {
                            let length = Math.sqrt(Math.pow(e.offsetX - link.target.x, 2) + Math.pow(e.offsetY - link.target.y, 2))
                            link.length = length
                        } else if (nodeDragCurrent.id === link.target.id) {
                            let length = Math.sqrt(Math.pow(e.offsetX - link.source.x, 2) + Math.pow(e.offsetY - link.source.y, 2))
                            link.length = length
                        }
                    }
                })
                setLinks(copyLinks)
            }
            let copyNodes = [...nodes]
            copyNodes.forEach(node => {
                if (node.id === nodeDragCurrent.id) {
                    node.x = e.offsetX
                    node.y = e.offsetY
                }
            })
            setNodes(copyNodes)
            setMyDragNodeId('')
        }
    }

    useEffect(() => {
        let svg = document.getElementById("canvasDrawDfa");
        if (svg) {
            svg.addEventListener("mousemove", handleMoveMouseAddLink);
            svg.addEventListener("contextmenu", handleContextMenuSvg);

            let circles = document.querySelectorAll("#canvasDrawDfa circle");
            if (circles) {
                circles.forEach((circle) => {
                    circle.addEventListener('contextmenu', (e) => {
                        e.preventDefault()
                        if (mode === 3 || mode === 1) {
                            setMyDragNodeId(e.target.getAttribute('id'))
                        }
                    })
                });
            }
        }
        return () => {
        };
    })

    return (
        <div >
            <div id='canvasDisplay'>
                {/* <svg id="canvasDrawDfa" width={widthSvg} height={heightSvg}></svg> */}
            </div>
        </div>
    )
}

export default ToolDisplay;