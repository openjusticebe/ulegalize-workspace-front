import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    FormGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap';
import Select from 'react-select';
import ItemDTO from '../../model/ItemDTO';
import { getUserResponsableList } from '../../services/SearchService';
import { useAuth0 } from '@auth0/auth0-react';
import Switch from 'react-bootstrap-switch';
import AsyncSelect from 'react-select/async';
import { getAffairesByVcUserIdAndSearchCriteria } from '../../services/DossierService';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );

export default function CreateDossierField( {
                                                label,
                                                modalDetails,
                                                toggle,
                                                showMessage,
                                                createDossier,
                                                attachDossier,
                                                isLoading,
                                                vckeySelected,
                                                email,
                                                userId
                                            } ) {
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const [switchCreate, setSwitchCreate] = useState( true );
    const [dossier, setDossier] = useState( null );
    const [responsable, setResponsable] = useState( new ItemDTO( { value: userId, label: email } ) );
    const { getAccessTokenSilently } = useAuth0();

    const _createDossier = () => {
        if ( !responsable.value ) {
            showMessage( label.affaire.error9, 'danger' );
        } else {
            if(switchCreate === true) {
                createDossier( responsable.value );
            } else {
                if(isNil(dossier)) {
                    showMessage( label.affaire.error17, 'danger' );
                    return;
                }
                attachDossier( responsable.value, dossier.value );
            }
        }
    };

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {

                return new ItemDTO( data );
            } );
            setUserResponsableList( profiles );
        })();
    }, [getAccessTokenSilently] );

    const _loadDossierOptions = async ( inputValue, callback ) => {
        const accessToken = await getAccessTokenSilently();
        let result = await getAffairesByVcUserIdAndSearchCriteria( accessToken, inputValue );

        if ( !isNil( result ) ) {
            if ( !isNil( result.data ) ) {

                callback(
                    map( result.data, dossier => {
                        return new ItemDTO( dossier );
                    } ) );

            } else if ( result.error ) {
                // no data
            }
        }
    };

    return (
        <Modal size="md" isOpen={modalDetails} toggle={toggle}>
            <ModalHeader tag="h4" toggle={toggle}>
                {label.createdossier.label1}
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col lg={12} md={12} sm={12}>
                        <h4>
                            {label.createdossier.label2}
                        </h4>
                        <Switch
                            value={switchCreate}
                            defaultValue={switchCreate}
                            offColor="primary"
                            onText={label.common.label2}
                            offText={label.common.label3}
                            onColor="primary"
                            onChange={value => setSwitchCreate( !switchCreate )
                            }
                        />{' '}
                    </Col>
                </Row>
                {!switchCreate ?
                    <Row>
                        <Col lg="12">
                            <FormGroup>
                                <AsyncSelect
                                    value={dossier}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    cacheOptions
                                    loadOptions={_loadDossierOptions}
                                    onChange={(newValue)=> setDossier( newValue )
                                    }
                                    placeholder="numero dossier ou annee"
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    : null}
                <hr className="my-2"/>
                <Row>
                    <Col md="10">
                        <Label>{label.affaire.lblRespDoss}</Label>
                        <FormGroup>
                            <Select
                                value={responsable}
                                className="react-select info"
                                classNamePrefix="react-select"
                                name="singleSelect"
                                onChange={value => setResponsable( value )}
                                options={userResponsableList}
                                placeholder={label.affaire.lblRespDoss}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>{label.common.close}</Button>
                <Button color="primary" type="button" disabled={isLoading || !switchCreate}
                        onClick={_createDossier}
                >
                    {isLoading ? (
                        <Spinner
                            size="sm"
                            color="secondary"
                        />
                    ) : null}
                    {' '} {label.common.new}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

