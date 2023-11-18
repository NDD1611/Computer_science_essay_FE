
export const calcFileSize = (size: string): string => {
    let newSize = parseInt(size)
    if (newSize < 1024) {
        return newSize + 'B'
    } else if (newSize >= 1024 && newSize < 1024 * 1024) {
        return Math.floor((newSize / 1024) * 100) / 100 + 'KB'
    } else if (newSize >= 1024 * 1024 && newSize < 1024 * 1024 * 1024) {
        return Math.floor((newSize / (1024 * 1024)) * 100) / 100 + 'MB'
    }
}