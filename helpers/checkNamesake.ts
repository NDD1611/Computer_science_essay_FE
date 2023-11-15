import { folder } from "../component/DriverPage/DriverPage";
import { findChildOfFolder } from "./findChildOfFolder";
export const checkNamesake = (
  folders: folder[],
  folderCurrent: folder,
  folderName: string
): boolean => {
  let childFolders = findChildOfFolder(folders, folderCurrent._id);
  let check: boolean = false;
  childFolders.forEach((fol) => {
    if (fol.name == folderName) {
      check = true;
    }
  });
  return check;
};
