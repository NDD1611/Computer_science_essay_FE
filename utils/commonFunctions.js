
export let progressOneNode = (formNodeId, node) => {
    let nodeKeys = Object.keys(node)
    let pathOfOneNode = []
    for (let key of nodeKeys) {
        let listToNodeId = node[key]
        let alphabets = key
        if (alphabets === '$') {
            alphabets = 'ε'
        }
        if (listToNodeId.length !== 0) {
            listToNodeId.forEach(toId => {
                let path = {
                    source: formNodeId,
                    target: toId,
                    label: alphabets
                }
                pathOfOneNode.push(path)
            });
        }
    }
    return pathOfOneNode
}

export let transition_function = (transitionDatas) => {
    let transitionKeys = Object.keys(transitionDatas)
    let listPathAllNodes = []

    for (let key of transitionKeys) {
        let pathOfOneNode = progressOneNode(key, transitionDatas[key])
        listPathAllNodes = [
            ...listPathAllNodes,
            ...pathOfOneNode
        ]
    }
    return listPathAllNodes
}
export let transitionFunctionToLinks = (transitionDatas) => {
    let transitionKeys = Object.keys(transitionDatas)
    let listPathAllNodes = []

    for (let key of transitionKeys) {
        let pathOfOneNode = progressOneNode(key, transitionDatas[key])
        listPathAllNodes = [
            ...listPathAllNodes,
            ...pathOfOneNode
        ]
    }
    return listPathAllNodes
}

export let checkForDuplicatePath = (links) => {
    let listLinkTrungNhauTheoCap = []
    let listLinkTrungNhau = []
    for (let i = 0; i < links.length - 1; i++) {
        for (let j = i + 1; j < links.length; j++) {
            let linkI = links[i]
            let linkJ = links[j]
            if (linkI.source === linkJ.target && linkI.target === linkJ.source) {
                let newObj = {
                    link1: linkI,
                    link2: linkJ
                }
                listLinkTrungNhau.push(linkI)
                listLinkTrungNhau.push(linkJ)
                listLinkTrungNhauTheoCap.push(newObj)
            }
        }
    }
    return listLinkTrungNhauTheoCap
}

export let findVectors = (x1, y1, x2, y2) => {
    let vectorCPX = x2 - x1
    let vectorCPY = y2 - y1

    let vectorPTX = vectorCPY
    let vectorPTY = -vectorCPX
    let length = Math.sqrt(Math.pow((vectorCPX), 2) + Math.pow((vectorCPY), 2))
    let vectors = {
        vtcp: {
            x: vectorCPX,
            y: vectorCPY
        },
        vtpt: {
            x: vectorPTX,
            y: vectorPTY
        },
        length
    }
    return vectors
}

export let findShadowOfPointFromVector = (pointX, pointY, vectorX, vectorY) => {
    return {
        x: pointX + vectorX,
        y: pointY + vectorY
    }
}


export let evaluateOfLinkLabelX = (d, widthSvg, radiusCircle, lengthDistanceEdge, listLinkTrung) => {
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
    return labelX
}

export let evaluateOfLinkLabelY = (d, heightSvg, radiusCircle, lengthDistanceEdge, listLinkTrung) => {
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
    return labelY
}

export let pathLink = (d, widthSvg, heightSvg, radiusCircle, lengthDistanceEdge, listLinkTrung) => {
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
}

export let listLinkToTransitionFunctionForNFA = (states, links) => {
    let transition_function = {}
    if (states) {
        states.forEach(state => {

            transition_function[state] = {}

            links.forEach(link => {
                let alphabets = link.label
                transition_function[state][alphabets] = []
            })

            links.forEach(link => {
                let sourceId = link.source.id
                let alphabets = link.label
                if (sourceId === state) {
                    let targetId = link.target.id

                    if (!transition_function[state][alphabets].includes(targetId)) {
                        transition_function[state][alphabets].push(targetId)
                    }
                }
            })
        })
    }
    return transition_function
}


export const getEpsilonClosure = (state, transition_function) => {
    if (state && transition_function) {
        let closure_states = [state]
        let state_stack = [state]
        while (state_stack.length > 0) {
            let current_state = state_stack.pop()
            let readEpsilonToState = transition_function[current_state]['$']
            if (readEpsilonToState.length > 0) {
                readEpsilonToState.forEach(state => {
                    if (!closure_states.includes(state)) {
                        closure_states.push(state)
                        state_stack.push(state)
                    }
                })
            }
        }
        return closure_states
    }
}

export const transition_function_star = (state, alphabet, transition_function) => {
    let epsilonClosures = getEpsilonClosure(state, transition_function)
    let listStateClosureReadAlphabets = []
    if (epsilonClosures.length) {
        epsilonClosures.forEach(stateClosure => {
            let stateClosureReadAlphabets = transition_function[stateClosure][alphabet]
            if (stateClosureReadAlphabets.length) {
                stateClosureReadAlphabets.forEach(stateClosureReadAlphabet => {
                    if (!listStateClosureReadAlphabets.includes(stateClosureReadAlphabet)) {
                        listStateClosureReadAlphabets.push(stateClosureReadAlphabet)
                    }
                })
            }
        })
    }
    return listStateClosureReadAlphabets
}