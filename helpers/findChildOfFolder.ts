
import { folder } from "../component/DriverPage/DriverPage"

export const findChildOfFolder = (folders: folder[], folderId: string): folder[] => {
    if (folders) {
        let childLists = folders.filter((folder) => {
            return folder.parent?._id == folderId
        })
        return childLists
    }
}