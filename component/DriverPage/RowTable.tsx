import { Button, Image, Menu, Table, rem } from "@mantine/core"
import { folder } from "./DriverPage"
import { convertStringDateToDate } from "../../helpers/convertStringDateToDate"
import { calcFileSize } from "../../helpers/calcFileSize"
import { IconArrowDown, IconDots, IconTrash } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { initializeApp } from "firebase/app"
import { getBlob, getStorage, ref } from "firebase/storage"

export const RowTable = ({ folder: folder, folderClick, userDetails, handleDeleteFolder }) => {
    const [load, setLoad] = useState(false)

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

    const downloadFileFirebase = async (folder: folder) => {
        try {
            setLoad(true)
            const app = initializeApp(firebaseConfig);
            const storage = getStorage();
            console.log(folder)
            let fileNameOnCloud = folder.path.split('?')[0].split('%2F').pop()
            const storageRef = ref(storage, 'drive/' + fileNameOnCloud);

            let blob = await getBlob(storageRef)
            let pathBlob = URL.createObjectURL(blob)
            let aElement = document.createElement('a')
            aElement.href = pathBlob
            aElement.download = folder.name
            document.body.appendChild(aElement)
            aElement.click()
            document.body.removeChild(aElement)
            setLoad(false)
        } catch (e) {
            console.log(e, 'err')
        }
    }
    return <Table.Tr key={folder._id} className="hover:bg-zinc-200">
        <Table.Td h={50} onClick={() => { folderClick(folder) }} className="cursor-pointer flex gap-1 items-center">
            {folder.type == 'folder' && <Image w={15} h={15} src={'/assets/folder.png'} />}
            {folder.name}
        </Table.Td>
        <Table.Td onClick={() => { folderClick(folder) }}>{userDetails.name}</Table.Td>
        <Table.Td onClick={() => { folderClick(folder) }}>{convertStringDateToDate(folder.dateCreate)}</Table.Td>
        <Table.Td onClick={() => { folderClick(folder) }}>{folder.type == 'file' && calcFileSize(folder.size)}</Table.Td>
        <Table.Td>
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    {
                        load ?
                            <Button w={40} h={30} p={0} loading>
                                <IconDots size={15} />
                            </Button>
                            :
                            <Button w={40} h={30} p={0} >
                                <IconDots size={15} />
                            </Button>
                    }
                </Menu.Target>

                <Menu.Dropdown>
                    {folder.type == 'file' &&
                        <Menu.Item
                            leftSection={<IconArrowDown style={{ width: rem(14), height: rem(14) }} />}
                            onClick={(e) => { downloadFileFirebase(folder) }}
                        >
                            Download
                        </Menu.Item>}
                    <Menu.Divider />

                    <Menu.Item
                        color="red"
                        leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                        onClick={(e) => { handleDeleteFolder(folder) }}
                    >
                        Delete
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Table.Td>
    </Table.Tr>
}