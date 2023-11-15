import { folder } from "../component/DriverPage/DriverPage";

export const findRootFolder = (folders: folder[]): folder => {
  let folderCurrent = null;
  folders.forEach((folder) => {
    if (folder.parent == null) {
      folderCurrent = folder;
    }
  });
  return folderCurrent;
};
