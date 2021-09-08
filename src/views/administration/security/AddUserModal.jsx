import React, { useEffect, useState } from 'react';
import { Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import AsyncCreatableSelect from 'react-select/async-creatable';
import ItemDTO from '../../../model/ItemDTO';
import Select from 'react-select';
import { getFullUserList, getFunctions } from '../../../services/SearchService';
import { getFullUserResponsableList, getSecurityGroup, saveUserToVcKey } from '../../../services/AdminService';
import SecurityGroupUserDTO from '../../../model/admin/user/SecurityGroupUserDTO';

const isNil = require( 'lodash/isNil' );
const map = require( 'lodash/map' );

const AddUserModal = ( {
                           modal,
                           toggleIn,
                           item,
                           label,
                           handleshowAlert
                       } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [data, setData] = useState( new SecurityGroupUserDTO() );
    const [loading, setLoading] = useState( false );
    const [functionIdItems, setFunctionIdItems] = useState( [] );
    const [securityGroup, setSecurityGroup] = useState( [] );

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
                const resultGroup = await getSecurityGroup( accessToken );

                if ( !resultGroup.error ) {
                    _data = map( resultGroup.data, ( type ) => {
                        return new ItemDTO( { value : type.id, label: type.description } );
                    } );
                }
                setSecurityGroup( _data );
            } catch ( e ) {
                // doesn't work
            }
        })();
    }, [getAccessTokenSilently] );

    const handleSave = async () => {
        setLoading(true)
        if(isNil(data.functionId)) {
            handleshowAlert(label.users.error2, 'danger');
            setLoading(false)
            return;
        }
        if(isNil(data.email)) {
            handleshowAlert(label.users.error3, 'danger');
            setLoading(false)
            return;
        }
        if(isNil(data.securityGroupId)) {
            handleshowAlert(label.users.error5, 'danger');
            setLoading(false)
            return;
        }
        const accessToken = await getAccessTokenSilently();

        // check if this user email is already in the vc key
        let resultUser = await getFullUserResponsableList( accessToken );
        let arrUsers = map( resultUser.data, ( data ) => {
            return new SecurityGroupUserDTO( data );
        } );

        let error = false;
        arrUsers.forEach(user => {
            if(user.email === data.email) {
                error = true;
                return;
            }
        })
        if(error === true) {
            handleshowAlert(label.users.error4, 'danger');
            setLoading(false)
            return;
        }


        let result = await saveUserToVcKey( accessToken, data );
        // save as lawyer to transparency

        if(!result.error) {
            handleshowAlert(label.users.success1, 'primary');
            toggleIn();
        } else {
            handleshowAlert(label.users.error1, 'danger');
            setLoading(false)
        }



    };
    const _loadUsersOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getFullUserList( accessToken, inputValue );

        callback( map( result.data, data => {
            return new ItemDTO( data );
        } ) );
    };

    const _handleUserChange = ( newValue ) => {
        setData( { ...data,
            email: newValue.label,
            userEmailItem: newValue
        } );
    };

    return (
        <>
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
                                        value={data.userEmailItem}
                                        className="react-select info"
                                        classNamePrefix="react-select"
                                        cacheOptions
                                        loadOptions={_loadUsersOptions}
                                        defaultOptions
                                        onChange={_handleUserChange}
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
                        <Col md="10">
                            <Label>{label.users.label14}</Label>
                            <FormGroup>
                                <Select
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    name="singleSelect"
                                    value={data.securityGroupItem}
                                    onChange={value => setData( {
                                        ...data,
                                        securityGroupId: value.value,
                                        securityGroupItem: value
                                    } )
                                    }
                                    options={securityGroup}
                                    placeholder={label.users.label14}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        defaultChecked={data.shareDossier}
                                        type="checkbox"
                                        onChange={( e ) => setData( { ...data, shareDossier: e.target.checked } )}
                                    />{' '}
                                    <span className="form-check-sign">
                                        <span className="check">{label.users.label9}</span>
                                    </span>
                                </Label>
                            </FormGroup>
                        </Col>
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

export default AddUserModal;
