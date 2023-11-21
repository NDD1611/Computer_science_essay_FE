'use client'
import { Box, Breadcrumbs, Button, Flex, Image, Menu, Modal, NavLink, Table, Text, TextInput, rem } from "@mantine/core";
import Header from "../header";
import styles from "./DriverPage.module.scss";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { IconArrowBarUp, IconFolderPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { getAllFolder, createFolder, saveFile, deleteFolder } from "../../apiNode";
import { checkNamesake } from "../../helpers/checkNamesake";
import { findRootFolder } from "../../helpers/findRootFolder";
import { findChildOfFolder } from "../../helpers/findChildOfFolder";
import { findParentOfFolder } from "../../helpers/findParentOfFolder";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { RowTable } from "./RowTable";

export interface folder {
    _id: string;
    name: string;
    user: string;
    parent: any;
    dateCreate: string;
    size: string;
    type: string;
    path: string;
}

export const DriverPage = () => {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<any>();
    const [folderCurrent, setFolderCurrent] = useState<folder | null>();
    const [opened, { open, close }] = useDisclosure(false);
    const [folders, setFolders] = useState<folder[]>([]);
    const [folderName, setFolderName] = useState<string>("");
    const inputUploadFile = useRef<any>();
    const [progressUploads, setProgressUpload] = useState([])

    const firebaseConfig = useMemo(() => {
        return {
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_APP_ID,
            measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
        };
    }, []);

    useEffect(() => {
        let userDetailsLocal = JSON.parse(localStorage.getItem("userDetails"));
        if (!userDetailsLocal) {
            toast.warn("Sign in to use this feature");
            router.push("/login");
        }
        if (userDetailsLocal) {
            (async () => {
                if (userDetailsLocal) {
                    let res: any = await getAllFolder(userDetailsLocal._id);
                    let folders = res.data;
                    setFolders(folders);
                    let rootFolder: folder = findRootFolder(folders, userDetailsLocal._id);
                    setFolderCurrent(rootFolder);
                }
                setUserDetails(userDetailsLocal);
            })();
        }
    }, []);

    const refreshDrive = async () => {
        let response: any = await getAllFolder(userDetails._id);
        let folders = response.data;
        setFolders(folders);
    }

    const handleCreateFolder = async () => {
        if (folderName.length != 0) {
            let check: boolean = checkNamesake(folders, folderCurrent, folderName);
            if (check) {
                toast.warn("Folder name is exit!");
            } else {
                let path = folderCurrent.path + "/" + folderName;
                let res: any = await createFolder(
                    folderName,
                    folderCurrent._id,
                    userDetails._id,
                    path
                );
                if (res.err) {
                    toast.error("create folder failed!");
                } else {
                    toast.success(res?.data);
                    close();
                    refreshDrive()
                }
            }
        } else {
            toast.warn("Please enter a name for the folder");
        }
    };
    const folderClick = (folder: folder) => {
        if (folder.type == 'folder') {
            setFolderCurrent(folder);
        }
    };
    const handleDeleteFolder = async (folder: folder) => {
        let res = await deleteFolder(folder._id)
        if (res.err == false) {
            toast.success(res?.response?.data)
            refreshDrive()
        } else {
            toast.error(res?.exception?.response?.data)
        }
    }
    const build = () => {
        if (folderCurrent) {
            let childFolders: folder[] = findChildOfFolder(
                folders,
                folderCurrent._id
            );
            if (childFolders) {
                return childFolders?.map((folder: folder) => {
                    return <RowTable
                        userDetails={userDetails}
                        folder={folder}
                        folderClick={folderClick}
                        handleDeleteFolder={handleDeleteFolder}
                    ></RowTable>
                });
            }
        }
        return null
    }
    let rows = build()

    const handleClickBreadcrumd = (folder) => {
        setFolderCurrent(folder);
    };

    let breadcrumd = useMemo(() => {
        let current = { ...folderCurrent };
        let listPath = [folderCurrent];
        while (current?.parent != null) {
            let parent = findParentOfFolder(folders, current);
            listPath.push(parent);
            current = { ...parent };
        }

        let paths = listPath.reverse();
        return paths.map((folder) => {
            if (folder)
                return (
                    <span
                        onClick={(e) => {
                            handleClickBreadcrumd(folder);
                        }}
                        className="cursor-pointer"
                        key={folder._id}
                    >
                        {folder.name}
                    </span>
                );
        });
    }, [folderCurrent]);

    const handleClickMydrive = () => {
        let rootFolder = findRootFolder(folders, userDetails._id);
        if (rootFolder) {
            setFolderCurrent(rootFolder);
        }
    };

    const handleClickButtonUpload = () => {
        if (inputUploadFile.current) {
            inputUploadFile.current.click();
        }
    };
    const handleChangeInputFile = (e: ChangeEvent<HTMLInputElement>) => {
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        let file: File | undefined | null = e.target.files[0];
        if (file) {
            let dateUploadFile = Date.now();
            let progressData = {
                id: dateUploadFile,
                name: file.name
            }
            setProgressUpload([...progressUploads, progressData])
            let type = file.type;
            let fileBlob = file instanceof Blob ? file : new Blob([file], { type: type });
            let fileName = dateUploadFile + "-" + Math.round(Math.random() * 1e9) + "." + file.name.split(".").pop();
            const storageRef = ref(storage, "drive/" + fileName);
            const uploadTask = uploadBytesResumable(storageRef, fileBlob);
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    let progressElement = document.getElementById(dateUploadFile.toString())
                    if (progressElement) {
                        progressElement.style.width = `${progress}%`
                    }
                    if (progress == 100) {
                        let newProgressUpload = progressUploads.filter(progress => {
                            return progress.id != dateUploadFile
                        })
                        setProgressUpload(newProgressUpload)
                    }
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            break;
                        case 'storage/canceled':
                            break;
                        case 'storage/unknown':
                            break;
                    }
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        let res: any = await saveFile(file.name, folderCurrent._id, userDetails._id, downloadURL, file.size.toString())
                        if (res.err) {
                            toast.error("upload file failed!");
                        } else {
                            toast.success(res?.data);
                            close();
                            let response: any = await getAllFolder(userDetails._id);
                            let folders = response.data;
                            setFolders(folders);
                        }
                    });
                }
            );
        }
    };

    return (
        <>
            <Header />
            <Modal
                opened={opened}
                onClose={close}
                title="Create folder"
                centered
                classNames={styles}
            >
                <TextInput
                    value={folderName}
                    mt="md"
                    placeholder="folder name..."
                    label="Folder Name"
                    error=""
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setFolderName(event.target.value);
                    }}
                />
                <Button mt={10} color="#202e3e" onClick={handleCreateFolder}>
                    Ok
                </Button>
            </Modal>
            <Flex component="div">
                <Box component="div" w={"25%"} p={10} className={styles.leftDrive}>
                    <Image w={"50%"} src="/assets/logoDrive.png" />
                    <div className="text-gray-500">CATEGORIES</div>
                    <Box component="div" className={styles.folder} px={20}>
                        <NavLink
                            label="My Drive"
                            childrenOffset={28}
                            active={true}
                            onClick={handleClickMydrive}
                        ></NavLink>
                    </Box>
                </Box>

                <Box component="div" w={"75%"} p={15}>
                    <div className="pb-2">
                        <Breadcrumbs>{breadcrumd}</Breadcrumbs>
                    </div>
                    <div className="border-b-2  pb-1 flex items-center">
                        <Button
                            leftSection={<IconFolderPlus />}
                            onClick={open}
                            color="#202e3e"
                        >
                            Create
                        </Button>
                        <Button
                            ml={10}
                            leftSection={<IconArrowBarUp />}
                            color="#202e3e"
                            onClick={handleClickButtonUpload}
                        >
                            Upload
                        </Button>
                        <input
                            className="hidden"
                            ref={inputUploadFile}
                            type="file"
                            onChange={handleChangeInputFile}
                        />
                    </div>
                    <Box component="div">
                        <Table stickyHeader stickyHeaderOffset={60}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Title</Table.Th>
                                    <Table.Th>Owner</Table.Th>
                                    <Table.Th>Modified time</Table.Th>
                                    <Table.Th>Size</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows && rows}</Table.Tbody>
                        </Table>
                    </Box>
                </Box>
            </Flex>
            <Box component="div" className={styles.progressContainer}>
                {
                    progressUploads.length != 0 &&
                    progressUploads.map(progress => {
                        return <Box key={progress.id} className={styles.progress}>
                            <Text className={styles.fileName}>{progress.name}</Text>
                            <div className={styles.progressBar}>
                                <div id={progress.id} className={styles.bar}></div>
                            </div>
                        </Box>
                    })
                }
            </Box>
        </>
    );
};
