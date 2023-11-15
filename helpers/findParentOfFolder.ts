import { folder } from "../component/DriverPage/DriverPage";

export const findParentOfFolder = (
  folders: folder[],
  folderCurrent: folder
): folder => {
  let result: folder;
  folders.forEach((folder) => {
    if (folder._id == folderCurrent.parent._id) {
      result = folder;
    }
  });
  return result;
};
