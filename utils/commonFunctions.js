
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
export let checkLinkTrungNhau = (links) => {
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
