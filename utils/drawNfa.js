

import { select, forceSimulation, forceLink, forceManyBody, forceCenter, selectAll, pointer, drag } from "d3";
import {
    progressOneNode, transition_function, checkLinkTrungNhau, findVectors, findShadowOfPointFromVector
} from './commonFunctions'

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

export let drawNfa = (data, force) => {

    const lengthDistanceEdge = 50

    let states = data.states

    let newStates = states.map(((state, index) => {
        let newState = {
            id: state,
            label: index.toString()
        }
        return newState
    }))

    let nodes = [...newStates];


    let links = transition_function(data.transition_function)

    let listLinkTrungNhauTheoCap = checkLinkTrungNhau(links)

    // Tạo SVG
    let svg = select("#myCanvas");


    // Tạo đối tượng mô phỏng đồ thị
    let simulation = forceSimulation(nodes)
        .force("link", forceLink(links).id(d => d.id).distance(200))
        .force("center", forceCenter(svg.attr("width") / 2, svg.attr("height") / 2))
        .force("charge", forceManyBody().strength(-100))


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
        .attr("r", 30)
        .attr('id', d => d.id)


    //  Vẽ văn bản trong các node
    let nodeLabels = svg.selectAll(".node-label")
        .data(nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("dy", 5) // Vị trí theo trục y
        .style("text-anchor", "middle")
        .text(d => "q" + d.label);

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
                for (let i = 0; i < listLinkTrungNhauTheoCap.length; i++) {
                    let { link1, link2 } = listLinkTrungNhauTheoCap[i]
                    if (d === link1 || d === link2) {
                        pointControlX = pointCenterX + (vectors.vtpt.x / percentEdge)
                        pointControlY = pointCenterY + (vectors.vtpt.y / percentEdge)
                    }
                }
                return `M ${d.source.x} ${d.source.y} C ${pointControlX} ${pointControlY}, ${pointControlX} ${pointControlY}, ${d.target.x} ${d.target.y}`
            })

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        linkLabels
            .attr("x", d => {
                for (let i = 0; i < listLinkTrungNhauTheoCap.length; i++) {
                    let { link1, link2 } = listLinkTrungNhauTheoCap[i]
                    if (d === link1 || d === link2) {
                        let vectors = findVectors(d.source.x, d.source.y, d.target.x, d.target.y)
                        let percentEdge = vectors.length / lengthDistanceEdge
                        return ((d.source.x + d.target.x) / 2) + (vectors.vtpt.x / percentEdge)
                    }
                }
                return ((d.source.x + d.target.x) / 2)
            })
            .attr("y", d => {
                for (let i = 0; i < listLinkTrungNhauTheoCap.length; i++) {
                    let { link1, link2 } = listLinkTrungNhauTheoCap[i]
                    if (d === link1 || d === link2) {
                        let vectors = findVectors(d.source.x, d.source.y, d.target.x, d.target.y)
                        let percentEdge = vectors.length / lengthDistanceEdge
                        return ((d.source.y + d.target.y) / 2) + (vectors.vtpt.y / percentEdge)
                    }
                }
                return ((d.source.y + d.target.y) / 2)
            });

        nodeLabels
            .attr("x", d => d.x)
            .attr("y", d => d.y);
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