import React, { useState, useEffect, useRef } from 'react';

import {
    Button,
    Form,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Table,
} from 'reactstrap';
import ItemDTO from '../model/ItemDTO';
import NotificationAlert from 'react-notification-alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getOptionNotification } from '../utils/AlertUtils';
import { useAuth0 } from '@auth0/auth0-react';
import { moveFile, getDossierListPopup } from '../services/InboxService';
import moment from 'moment';
import 'moment/locale/fr';

import { registerLocale } from "react-datepicker";
import fr from 'date-fns/locale/fr';
const map = require('lodash/map');
moment.locale('fr');
registerLocale('fr', fr)

export default function InModalPanel(props) {

    const handleMoveEvent = () => {
        setLoading(true);
        moveFileToFolder();
    }
    const { label } = props.parentProps;
    const path = '';
    const notificationAlert = useRef(null);
    const { getAccessTokenSilently } = useAuth0();
    const { toggleIn, modal, getFilesByUserId } = props;
    const [dossierList, setDossierList] = useState([]);
    const userId = props.userId;
    const [selectedFolder, setSelectedFolder] = useState(null);
    const moveFilesData = props.moveFilesData;
    const [loading, setLoading] = useState(false);
    let uploadIndex = 0;

    useEffect(() => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let result = await getDossierListPopup(accessToken, userId, path); // '' - Folder List
            let _dossierList = map(result.data, data => {
                return new ItemDTO(data);
            });
            setDossierList(_dossierList);

        })();
    }, [getAccessTokenSilently]);

    const handleFolderPressed = (fileObject) => {
        setSelectedFolder(fileObject)
    }

    const moveFileToFolder = async () => {
        const accessToken = await getAccessTokenSilently();
        let result = await moveFile(accessToken, userId, moveFilesData[uploadIndex].filename, selectedFolder.value);
        if (result.data === 'ok') {
            if (moveFilesData.length === (uploadIndex + 1)) {
                notificationAlert.current.notificationAlert(getOptionNotification(label.in.label14, 'danger'));
                setLoading(false);
                setTimeout(function () {
                    toggleIn();
                    getFilesByUserId();
                }, 1000);
            } else {
                uploadIndex = uploadIndex + 1;
                moveFileToFolder();
            }
        } else {
            setLoading(false);
            notificationAlert.current.notificationAlert(getOptionNotification(label.in.label15, 'danger'));
            setTimeout(function () {
                toggleIn();
                getFilesByUserId();
            }, 1000);
        }
    }

    return (
        <Modal size="lg" isOpen={modal} toggle={toggleIn}>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <ModalBody>
                <ModalHeader>
                    <h3>{label.in.label8}</h3>
                </ModalHeader>
                <Form>
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <Table responsive borderless height="300">
                            <tbody>
                                {dossierList.map(fileObject => (
                                    <tr key={fileObject.value} >
                                        <td className="text-left"><Button color="link" onClick={() => handleFolderPressed(fileObject)}>{fileObject.label}</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" onClick={handleMoveEvent} disabled={(selectedFolder === null)}> {label.in.label9}</Button>
                {
                    loading && <CircularProgress color="primary" size={35} />
                }
                <Button variant="secondary" onClick={toggleIn}> {label.common.cancel}</Button>
            </ModalFooter>
        </Modal>
    )
}