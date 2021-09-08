import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import AsyncCreatableSelect from 'react-select/async-creatable';
import ItemDTO from '../../../model/ItemDTO';
import Select from 'react-select';
import { getFunctions } from '../../../services/SearchService';
import {
    updateIsActiveLawfirmUsers
} from '../../../services/AdminService';
import { updateRoleLawfirmUser } from '../../../services/LawfirmsService';
import { getOptionNotification } from '../../../utils/AlertUtils';
import NotificationAlert from 'react-notification-alert';

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
    const [data, setData] = useState( item );
    const [loading, setLoading] = useState( false );
    const [functionIdItems, setFunctionIdItems] = useState( [] );
    const notificationAlert = useRef(null);

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
        setLoading(true)
        if(isNil(data.functionId)) {
            handleshowAlert(label.users.error2, 'danger');
            return;
        }
        if(isNil(data.email)) {
            handleshowAlert(label.users.error3, 'danger');
            return;
        }
        const accessToken = await getAccessTokenSilently();

        let result = await updateRoleLawfirmUser( accessToken, data );
        // save as lawyer to transparency

        if(!result.error) {
            handleshowAlert(label.users.success100, 'primary');
            toggleIn();
        } else {
            handleshowAlert(label.users.error1, 'danger');
            setLoading(false)
        }



    };

    const _updateIsActiceUser = async ( userId, isActive ) => {
        const accessToken = await getAccessTokenSilently();

        const result = await updateIsActiveLawfirmUsers( accessToken, userId, isActive );
        if ( !result.error ) {
            let message = isActive === true ? label.users.label100 : label.users.label101; //props.label.public.label102 : props.label.public.label103;
            notificationAlert.current.notificationAlert( getOptionNotification( message, 'primary' ) );
        }
        setData({
            ...data,
            active : isActive
        });
    };

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert} />
            </div>
            <Modal size="md" isOpen={modal} toggle={toggleIn}>
                <ModalHeader toggle={toggleIn}>
                    <h4>{label.users.label1}</h4>
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
                        <FormGroup check>
                            <Label check>
                                <Input
                                    defaultChecked={data.active}
                                    type="checkbox"
                                    onChange={( e ) => _updateIsActiceUser( data.id, !data.active )}
                                />
                                <span className="form-check-sign">
                                    <span className="check">{label.users.label102}</span>
                                </span>
                            </Label>
                        </FormGroup>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => toggleIn()}>
                        {label.common.cancel}
                    </Button>
                    {loading && <CircularProgress color="primary" size={35}/>}
                    <Button color="primary" onClick={handleSave} disable={loading}>
                        {label.common.save}
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default UpdateUserModal;
