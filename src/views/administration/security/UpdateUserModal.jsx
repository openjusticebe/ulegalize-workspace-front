import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import AsyncCreatableSelect from 'react-select/async-creatable';
import ItemDTO from '../../../model/ItemDTO';
import Select from 'react-select';
import { getFunctions } from '../../../services/SearchService';
import { shareUserFolder, updateIsActiveLawfirmUsers } from '../../../services/AdminService';
import { updateRoleLawfirmUser } from '../../../services/LawfirmsService';
import { getOptionNotification } from '../../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';
import ReactBSAlert from 'react-bootstrap-sweetalert';

const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );

const UpdateUserModal = ( {
                              modal,
                              toggleIn,
                              item,
                              label,
                              handleshowAlert
                          } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [deleteAlert, setDeleteAlert] = useState( null );
    const [data, setData] = useState( item );
    const [loading, setLoading] = useState( false );
    const [functionIdItems, setFunctionIdItems] = useState( [] );
    const notificationAlert = useRef( null );

    useEffect( () => {
        (async () => {
            try {
                const accessToken = await getAccessTokenSilently();

                let _data = [];
                const result = await getFunctions( accessToken );

                if ( !result.error ) {
                    _data = map( result.data, ( type ) => {
                        return new ItemDTO( type );
                    } );
                }
                setFunctionIdItems( _data );
            } catch ( e ) {
                // doesn't work
            }
        })();
    }, [getAccessTokenSilently] );

    const handleSave = async () => {
        setLoading( true );
        if ( isNil( data.functionId ) ) {
            handleshowAlert( label.users.error2, 'danger' );
            return;
        }
        if ( isNil( data.email ) ) {
            handleshowAlert( label.users.error3, 'danger' );
            return;
        }
        const accessToken = await getAccessTokenSilently();

        let result = await updateRoleLawfirmUser( accessToken, data );
        // save as lawyer to transparency

        if ( !result.error ) {
            handleshowAlert( label.users.success100, 'primary' );
            toggleIn();
        } else {
            handleshowAlert( label.users.error1, 'danger' );
            setLoading( false );
        }

    };

    const _updateIsActiceUser = async ( isActive ) => {
        setData( {
            ...data,
            active: isActive
        } );
    };
    const _shareUserFolder = async () => {
        setLoading( true );
        const accessToken = await getAccessTokenSilently();

        const result = await shareUserFolder( accessToken );
        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.users.label103, 'primary' ) );
        }
        setLoading( false );
    };

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            <Modal size="md" isOpen={modal} toggle={toggleIn}>
                <ModalHeader toggle={toggleIn}>
                    <h4>{label.users.label0}</h4>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md="10">
                            <Label>{label.users.label10}</Label>
                            <FormGroup>
                                <AsyncCreatableSelect
                                    isDisabled={true}
                                    value={data.userEmailItem}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    cacheOptions
                                    defaultOptions
                                    placeholder={label.common.label14}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <Label>
                                {label.users.label11}
                            </Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="10">
                            <Label>{label.users.label12}</Label>
                            <FormGroup>
                                <Select
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    name="singleSelect"
                                    value={data.functionIdItem}
                                    onChange={value => setData( {
                                        ...data,
                                        functionId: value.value,
                                        functionIdItem: value
                                    } )
                                    }
                                    options={functionIdItems}
                                    placeholder={label.users.label12}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        checked={data.active}
                                        type="checkbox"
                                        onChange={( e ) => {
                                            setDeleteAlert( <ReactBSAlert
                                                warning
                                                style={{ display: 'block', marginTop: '100px' }}
                                                title={data.active ? label.users.label104 : label.users.label106}
                                                onConfirm={() => {
                                                    _updateIsActiceUser( !data.active )

                                                    setDeleteAlert( null );
                                                }}
                                                onCancel={() => {
                                                    _updateIsActiceUser( data.active )

                                                    setDeleteAlert( null ); }}
                                                confirmBtnBsStyle="success"
                                                cancelBtnBsStyle="danger"
                                                confirmBtnText={label.common.label2}
                                                cancelBtnText={label.common.cancel}
                                                showCancel
                                                btnSize=""
                                            >
                                                {data.active ? label.users.label105 : label.users.label107}
                                            </ReactBSAlert> );
                                        }}
                                    />
                                    <span className="form-check-sign">
                                    <span className="check">{label.users.label102}</span>
                                </span>
                                </Label>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Label></Label>
                            <FormGroup>
                                <Button color="primary"
                                        disabled={loading}
                                        onClick={() => {
                                            _shareUserFolder();
                                        }}>
                                    {loading ? (
                                        <Spinner
                                            size="sm"
                                            color="secondary"
                                        />
                                    ) : null}
                                    {' '}
                                    {label.users.label9}
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => toggleIn()}>
                        {label.common.cancel}
                    </Button>
                    <Button color="primary" onClick={handleSave} disable={loading}>
                        {loading ? (
                            <Spinner
                                size="sm"
                                color="secondary"
                            />
                        ) : null}
                        {' '}
                        {label.common.save}
                    </Button>
                </ModalFooter>
            </Modal>
            {deleteAlert}
        </>
    );
};

export default UpdateUserModal;
