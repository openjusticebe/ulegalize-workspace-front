import React, { useState, useRef, useEffect } from 'react';
// reactstrap components
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Table, FormGroup, Input, Label } from 'reactstrap';
import { Button } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import ReactBSAlert from "react-bootstrap-sweetalert";
import { getOptionNotification } from '../utils/AlertUtils';
import Dropzone from 'react-dropzone';
import ItemDTO from '../model/ItemDTO';
import InboxDTO from '../model/In/InboxDTO';
import Select from 'react-select';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getUserResponsableList } from '../services/SearchService';
import { getDispatchingFilesByUserId, deletingFile, uploadFileInbox, downloadFile } from '../services/InboxService';
import InModalPanel from './InModalPanel';
import NotificationAlert from 'react-notification-alert';
import moment from 'moment';
import 'moment/locale/fr';
import { downloadWithName } from '../utils/TableUtils';


const map = require('lodash/map');
const filter = require('lodash/filter');

// nodejs library that concatenates classes
export default function In(props) {

    const { label, vckeySelected } = props;
    const _moveOptionData = [
        {
            'value': '1',
            'label': label.common.delete,
        },
        {
            'value': '2',
            'label': label.in.label8,
        },
    ]
    const notificationAlert = useRef(null);
    const { getAccessTokenSilently } = useAuth0();
    const [mailIn, setMailIn] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMailSelected, setIsMailSelected] = useState(false)
    const [moveFilesData, setMoveFilesData] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const moveOptionData = useRef(_moveOptionData)
    const [selectedOption, setSelectedOption] = useState(null)
    const [modalIn, setModalIn] = useState(false);
    const [userResponsableList, setUserResponsableList] = useState([]);
    const [deleteAlert, setDeleteAlert] = useState(null);

    useEffect(() => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let resultUser = await getUserResponsableList(accessToken, vckeySelected);
            let arrUsers = map(resultUser.data, data => {
                return new ItemDTO(data);
            });
            if (arrUsers.length > 0) {
                setSelectedUser(arrUsers[0])
                getFilesByUserId(arrUsers[0].value)
            }
            setUserResponsableList(arrUsers);
        })();
    }, [getAccessTokenSilently]);

    const onDrop = (files) => {
        setLoading(true);
        let formData = new FormData();
        formData.append('files', files[0]);
        formData.append('userId', selectedUser.value);
        let reader = new FileReader();
        let file = files[0];

        reader.onloadend = () => {
            setLoading(false);
            uploadFile(formData)
        };
        reader.readAsDataURL(file);
    }
    const uploadFile = async (formData) => {
        const accessToken = await getAccessTokenSilently();
        let result = await uploadFileInbox(accessToken, formData);
        const file = new InboxDTO(result.data);
        setMailIn([...mailIn, file]);
        // if (result.data === 'ok') {
        notificationAlert.current.notificationAlert(getOptionNotification(label.common.success3, 'primary'));
        // }
    }
    const onChangeMailSelection = (filename) => {
        let mailInData = mailIn
        let index = mailInData.findIndex(object => object.filename === filename);
        if (index !== -1) {
            let mailObject = mailInData[index]
            mailObject.mailSelected = !mailObject.mailSelected
            mailInData[index] = mailObject
            setMailIn(mailInData)
        }
        let _selectionData = mailInData.filter(item => item.mailSelected === true);
        if (_selectionData && _selectionData.length > 0) {
            setIsMailSelected(true)
        } else {
            setIsMailSelected(false)
        }

    }
    const onChangeUserSelection = (value) => {
        setSelectedUser(value)

        getFilesByUserId(value.value)
    }
    const getFilesByUserId = async (userId) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getDispatchingFilesByUserId(accessToken, userId);
        let files = map(result.data, data => {
            return new InboxDTO(data);
        });
        setMailIn(files);
    }
    const onChangeOptionSelection = (value) => {
        setSelectedOption(value)
        if (value.value === '1') {
            let _selectionData = mailIn.filter(item => item.mailSelected === true);
            if (_selectionData && _selectionData.length > 1) {
                notificationAlert.current.notificationAlert(getOptionNotification(label.in.error1, 'danger'));
            } else {
                // deleteFile(_selectionData[0].filename);
                deleteMessageModal(_selectionData[0].filename);
            }
        } else {
            const _selectionData2 = filter(mailIn, item => {
                return item.mailSelected === true
            });
            if (_selectionData2.length >= 1) {
                setMoveFilesData(_selectionData2);
                setModalIn(true);
            }
        }
    }
    const deleteFile = async (filename) => {
        const accessToken = await getAccessTokenSilently();
        let result = await deletingFile(accessToken, selectedUser.value, filename);
        if (result.data === 'ok') {
            let files = mailIn.filter(fileObject => fileObject.filename !== filename);
            notificationAlert.current.notificationAlert(getOptionNotification(label.in.label12, 'success'));
            setMailIn(files)
            setIsMailSelected(false)
        } else {
            notificationAlert.current.notificationAlert(getOptionNotification(label.in.label13, 'danger'));
        }
    }
    const toggleIn = () => {
        setModalIn(!modalIn);
    };

    const deleteMessageModal = (filename) => {
        setDeleteAlert((
            <ReactBSAlert
                warning
                style={{ display: "block", marginTop: "100px" }}
                title={label.in.label5}
                onConfirm={() => { deleteFile(filename); setDeleteAlert(null); }}
                onCancel={() => { setDeleteAlert(null); }}
                confirmBtnBsStyle="success"
                cancelBtnBsStyle="danger"
                confirmBtnText={label.in.label6}
                cancelBtnText={label.common.cancel}
                showCancel
                btnSize=""
            >
                {label.in.label7}
            </ReactBSAlert>
        ));
    };

    const handleDownloadFile = async (filename) => {
        const accessToken = await getAccessTokenSilently();
        let result = await downloadFile(accessToken, selectedUser.value, filename);
        setLoading(false);
        if (!result.error) {
            notificationAlert.current.notificationAlert(getOptionNotification(label.in.label10, 'success'));
            downloadWithName( result.data , filename );

        } else {
            notificationAlert.current.notificationAlert(getOptionNotification(label.in.label11, 'danger'));
        }
    }

    return (
        <>
            <div className="content">
                {deleteAlert}
                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert} />
                </div>
                {modalIn ? (
                    <InModalPanel
                        toggleIn={toggleIn}
                        modal={modalIn}
                        userId={selectedUser.value}
                        moveFilesData={moveFilesData}
                        getFilesByUserId={() => getFilesByUserId(selectedUser.value)}
                        parentProps={props}
                    />) : null}
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h5">{label.in.title}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Dropzone onDrop={onDrop} disableClick>
                                    {({ getRootProps, getInputProps }) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <div className={'thumbnail'}>
                                                <Col
                                                            className="font-icon-list col-lg-12 col-xs-6 col-xs-6"
                                                            lg="12"
                                                            md="12"
                                                            sm="12"
                                                            key="font-cloud"
                                                        >
                                                            <div className="font-icon-detail tim-icons-32">
                                                                <i className={'tim-icons icon-cloud-download-93 '} />
                                                                <p>{label.in.label17}</p>
                                                            </div>
                                                        </Col>

                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md="2">
                        <FormGroup>
                            <Select
                                value={selectedUser}
                                className="react-select info"
                                classNamePrefix="react-select"
                                name="singleSelect"
                                onChange={onChangeUserSelection}
                                options={userResponsableList}
                            />
                        </FormGroup>
                    </Col>
                    {
                        (isMailSelected === true) &&
                        <Col md="2">
                            <FormGroup>
                                <Select
                                    name='optionGroup'
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    value={selectedOption}
                                    onChange={onChangeOptionSelection}
                                    options={moveOptionData.current}
                                />
                            </FormGroup>
                        </Col>
                    }
                    {
                        loading && <CircularProgress color="primary" size={35}/>
                    }
                </Row>
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">{label.in.label16}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Table responsive>
                                    <tbody>
                                        <tr>
                                            <th>#</th>
                                            <th>{label.in.label2}</th>
                                            <th>{label.in.label3}</th>
                                            <th>{label.in.label4}</th>
                                        </tr>
                                        {mailIn.map(fileObject => (
                                            <tr key={fileObject.id}>
                                                <td className="text-left">
                                                    <FormGroup check>
                                                        <Label check>
                                                            <Input
                                                                defaultChecked={fileObject.mailSelected}
                                                                type="checkbox"
                                                                onChange={() => onChangeMailSelection(fileObject.filename)}
                                                            />{' '}
                                                            <span className="form-check-sign">
                                                                <span className="check"></span>
                                                            </span>
                                                        </Label>
                                                    </FormGroup>
                                                </td>
                                                <td className="text-left">{fileObject.filename}</td>
                                                <td className="text-left">{moment(fileObject.recDate).locale('fr').format('DD MMMM YYYY')}</td>
                                                <td className="text-left">
                                                    <Button color="primary"
                                                        onClick={() => { handleDownloadFile(fileObject.filename); setLoading(true); }}
                                                        disabled={loading}
                                                        >
                                                        <i className="fa fa-download" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>


        </>
    );
}

