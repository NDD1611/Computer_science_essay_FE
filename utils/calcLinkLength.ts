export const calcLinkLength = (sourceNodeId: string, targetNodeId: string, listNodes: any): number => {
    if (sourceNodeId && targetNodeId && listNodes.length) {
        let sourceNode = null
        listNodes.forEach(node => {
            if (node.id == sourceNodeId) {
                sourceNode = node
            }
        })
        let targetNode = null
        listNodes.forEach(node => {
            if (node.id == targetNodeId) {
                targetNode = node
            }
        })
        let length = Math.sqrt(Math.pow((sourceNode.x - targetNode.x), 2) + Math.pow((sourceNode.y - targetNode.y), 2))
        return Math.floor(length)
    }
} 