import React, { useEffect, useState } from 'react';

import { Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import ItemDTO from '../../model/ItemDTO';
import { useAuth0 } from '@auth0/auth0-react';
import ShareAffaireDTO from '../../model/affaire/ShareAffaireDTO';
import ShareUsersAffaire from './ShareUsersAffaire';
import Select from 'react-select';
import { getUserResponsableList } from '../../services/SearchService';
import { addShareUser } from '../../services/DossierService';
import { searchLawfirmByName } from '../../services/LawfirmsService';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );

export const ShareModal = ( props ) => {
    const {
        modal,
        showMessagePopup,
        affaireId,
        label,
        vckeySelected,
        toggleModal
    } = props;
    const { getAccessTokenSilently } = useAuth0();
    const [data, setData] = useState( new ShareAffaireDTO() );
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const [handleSuccess, setHandleSuccess] = useState( false );
    const [loadingSave, setLoadingSave] = useState( false );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {
                return new ItemDTO( data );
            } );
            setUserResponsableList( profiles );
            setData( {
                ...data,
                vcKey: vckeySelected,
                vcKeyItem: new ItemDTO( { value: vckeySelected, label: vckeySelected } )
            } );
        })();
    }, [vckeySelected] );

    const _loadVckeyOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await searchLawfirmByName( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, lawfirm => {
                        return new ItemDTO( { value: lawfirm.vckey, label: lawfirm.vckey } );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    const _handleVckeyChange = async ( newValue ) => {
        const accessToken = await getAccessTokenSilently();

        let resultUser = await getUserResponsableList( accessToken, vckeySelected, newValue.value );
        let profiles = map( resultUser.data, data => {
            return new ItemDTO( data );
        } );
        setUserResponsableList( profiles );
        setData( { ...data, vcKey: newValue.value, vcKeyItem: newValue } );
    };

    const _addUser = async ( ) => {
        setLoadingSave(true);
        if(isNil(data.vcKey)) {
            showMessagePopup(label.shareAffaire.error200, 'danger');
            setLoadingSave(false);
            return;
        }
        const accessToken = await getAccessTokenSilently();

        data.affaireId = affaireId;
        const result = await addShareUser(accessToken, data, true);

        if(!result.error) {
            setHandleSuccess( !handleSuccess );
            showMessagePopup(label.shareAffaire.success200, 'primary');
            setData( {
                ...new ShareAffaireDTO(),
                vcKey: vckeySelected,
                vcKeyItem: new ItemDTO( { value: vckeySelected, label: vckeySelected } )
            } );
        }
        setLoadingSave(false);
    };
    const _showMessage = async ( message, type ) => {
        setHandleSuccess( !handleSuccess );
        showMessagePopup(message, type);
    };



    return (
        <Modal size="lg" isOpen={modal} toggle={toggleModal}>
            <ModalHeader tag={'h4'} toggle={toggleModal}>{label.shareAffaire.label1}</ModalHeader>

            <ModalBody>
                <Row>
                    <Col lg="6">
                        <Label>{label.shareAffaire.label2}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={data.vcKeyItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadVckeyOptions}
                                defaultOptions
                                onChange={_handleVckeyChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col lg="12">
                        <Label>{label.shareAffaire.label3}</Label>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <FormGroup check className="form-check-radio">
                            <Label check>
                                <Input
                                    checked={data.allMembers === true}
                                    defaultValue="option1"
                                    id="allmemberRadio"
                                    name="allmemberRadio"
                                    type="radio"
                                    onChange={( e ) => setData( { ...data, allMembers: true } )}
                                />
                                <span className="form-check-sign"/>
                                {label.common.label2}
                            </Label>
                        </FormGroup>

                    </Col>
                    <Col md={5}>
                        <FormGroup check className="form-check-radio">
                            <Label check>
                                <Input
                                    checked={data.allMembers === false}
                                    defaultValue="option2"
                                    id="allmemberRadio2"
                                    name="allmemberRadio2"
                                    type="radio"
                                    onChange={( e ) => setData( { ...data, allMembers: false } )}
                                />
                                <span className="form-check-sign"/>
                                {label.common.label3}
                            </Label>
                        </FormGroup>

                    </Col>
                </Row>

                {data.allMembers === false ? (
                    <Row>
                        <Col md="6">
                            <Label>{label.shareAffaire.label4}</Label>
                            <FormGroup>
                                <Select
                                    isMulti
                                    value={data.userIdSelectedItem}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    name="singleSelect"
                                    onChange={value => setData( {
                                        ...data,
                                        userIdSelectedItem: value,
                                        userIdSelected: map(value , val=>{
                                            return val.value;
                                        })
                                    } )}
                                    options={userResponsableList}
                                    placeholder={label.affaire.lblRespDoss}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                ) : null }
                <Row>
                    <Col md={12}>
                        <Button color="primary" type="button" disabled={loadingSave}
                                onClick={_addUser}
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '} {label.common.add}
                        </Button>

                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <ShareUsersAffaire
                            updateList={handleSuccess}
                            label={label}
                            showMessagePopup={_showMessage}
                            toggleModal={toggleModal}
                            affaireId={affaireId} />

                    </Col>
                </Row>
            </ModalBody>

        </Modal>
    );
};