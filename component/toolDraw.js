
import { useEffect, useState } from 'react';
import {
    select, forceSimulation, forceLink, forceManyBody,
    forceCenter, selectAll, pointer, drag, forceX, forceY, dsvFormat
} from "d3";
import {
    evaluateOfLinkLabelX, evaluateOfLinkLabelY, pathLink,
    progressOneNode, transition_function, checkLinkTrungNhau,
    findVectors, findShadowOfPointFromVector
} from '../utils/commonFunctions'
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';
import headerActions from '../redux/action/headerActions';

const ToolDraw = ({ widthSvg,
    heightSvg,
    mode,
    nodes,
    setNodes = () => { },
    linkLength,
    links,
    setLinks = () => { },
    radiusCircle,
    finalStates,
    setFinalStates = () => { },
    initStates,
    setInitStates = () => { },
    nodeAfterRead = []
}) => {

    const [subMode, setSubMode] = useState('0')  //0:init no function, 1.0: draging link
    const [lengthDistanceEdge, setLengthDistanceEdge] = useState(50) // do cong cua link trung nhau
    const [linkFromId, setLinkFromId] = useState()
    const dispatch = useDispatch()

    useEffect(() => {
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
        }

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

        node.call(dragCustom(simulation));

        if (finalStates) {
            finalStates.forEach(finalId => {
                node.filter(d => d.id === finalId)
                    .classed("final-border", true);
            })
        }
        node.filter(d => d.id === initStates)
            .classed("start-border", true);
        node.filter(d => nodeAfterRead.includes(d.id))
            .classed("node-fill-background", true);
        node.filter(d => (d.id === initStates && finalStates.includes(d.id)))
            .classed("node-fill-start-end", true);


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
                label: '',
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
                        if (nodeId) {
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

        let paths = document.querySelectorAll('#myCanvas path')
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
            if (circles) {
                circles.forEach(circle => {
                    circle.removeEventListener('click', handleNodeClick)
                    circle.removeEventListener('dblclick', handleNodeClick)
                })
            }
            if (paths) {
                paths.forEach(path => {
                    path.removeEventListener('click', handlePathClick)
                })
            }
        }
    })

    useEffect(() => {
        if (nodes[0]) {
            setInitStates(nodes[0].id)
        }
    }, [nodes])

    useEffect(() => {
        dispatch({
            type: headerActions.SET_TITLE_HEADER,
            title: 'NFA to DFA'
        })
    }, [])

    return (
        <div>
            <div id='parentSvg'>
                {/* <svg id='myCanvas' width='600' height='600'></svg> */}
            </div>
        </div >
    )
}

export default ToolDraw;