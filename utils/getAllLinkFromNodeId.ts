export const getAllLinkFromNodeId = (nodeId: string, listLinks: any) => {
    let linksFromNodeId = []
    if (nodeId && listLinks.length) {
        listLinks.forEach(link => {
            if (link.source.id == nodeId || link.target.id == nodeId) {
                linksFromNodeId.push(link)
            }
        })
    }
    return linksFromNodeId
}