import React, { useEffect, useState } from 'react';
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

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { useAuth0 } from '@auth0/auth0-react';
import {
    createConseilByDossier,
    inviteConseil,
    updatePartieByDossier
} from '../../../services/transparency/CaseService';
import ItemPartie from '../../../model/affaire/ItemPartie';
import { getFullUserList, getFunctions } from '../../../services/SearchService';
import ItemDTO from '../../../model/ItemDTO';
import CreatableSelect from 'react-select/creatable';
import { validateEmail } from '../../../utils/Utils';

moment.locale( 'fr' );
registerLocale( 'fr', fr );
const isNil = require( 'lodash/isNil' );
const filter = require( 'lodash/filter' );
const isEmpty = require( 'lodash/isEmpty' );
const map = require( 'lodash/map' );
const forEach = require( 'lodash/forEach' );
const orderBy = require( 'lodash/orderBy' );

export const ConseilModal = ( {
                                  modal,
                                  isCreate,
                                  partie,
                                  label,
                                  dossierType,
                                  affaireId,
                                  showMessage,
                                  createPartie,
                                  updatePartie,
                                  partiesCas,
                                  toggleModal
                              } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [partieName, setPartieName] = useState( new ItemPartie() );
    const [loadingSave, setLoadingSave] = useState( false );
    const [functionIdItems, setFunctionIdItems] = useState( [] );
    const [users, setUsers] = useState( [] );

    useEffect( () => {
        (async () => {
            if ( !isNil( partie ) ) {
                let partieTemp = partie;

                if ( partieTemp && !isNil( partieTemp.email ) ) {
                    partieTemp.emailItem = new ItemDTO( { value: partieTemp.email, label: partieTemp.email } );
                }

                if ( partieTemp && !isNil( partieTemp.function ) ) {
                    partieTemp.functionItem = new ItemDTO( {
                        value: partieTemp.functionId,
                        label: partieTemp.function
                    } );
                }
                setPartieName( partieTemp );
            }
        })();
    }, [partie] );

    useEffect( () => {
        (async () => {
            try {

                const accessToken = await getAccessTokenSilently();
                let result = await getFullUserList( accessToken, '' );
                const usersTemp = map( result.data, data => {
                    return new ItemDTO( data );
                } );

                setUsers( usersTemp );
                let partieTemp = new ItemPartie();
                const resultFunction = await getFunctions( accessToken );
                const functionTemp = orderBy( map( resultFunction.data, data => {
                    if ( isNil( partie ) ) {
                        // creation mediation
                        // lawfirm is id 11
                        if ( dossierType === 'MD' && data.value === 11 ) {
                            partieTemp.functionItem = new ItemDTO( {
                                value: data.value,
                                label: data.label
                            } );
                        }
                        // creation
                        // LITIGANT_OPPOSING is id 9
                        if ( dossierType !== 'MD' && data.value === 9 ) {
                            partieTemp.functionItem = new ItemDTO( {
                                value: data.value,
                                label: data.label
                            } );
                        }
                    }

                    return new ItemDTO( data );
                } ), 'value', 'desc' );
                setFunctionIdItems( functionTemp );

                if ( isNil( partie ) ) {
                    setPartieName( partieTemp );
                }
            } catch ( e ) {
                // doesn't work
            }
        })();
    }, [getAccessTokenSilently] );

    const _updatePartie = async () => {
        if ( isCreate === false ) {
            setLoadingSave( true );
            const accessToken = await getAccessTokenSilently();

            if ( isNil( partieName ) || partieName === '' ) {
                showMessage( label.etat.error8, 'danger' );
                setLoadingSave( false );
                return;
            }
            if ( isNil( partieName.functionItem ) || partieName.functionItem === '' ) {
                showMessage( label.etat.error7, 'danger' );
                setLoadingSave( false );
                return;
            }

            if ( !validateEmail( partieName.email ) ) {
                showMessage( label.etat.error5, 'danger' );
                setLoadingSave( false );
                return;
            }

            // check if it exists
            const filterName = partiesCas ? filter( partiesCas, partie => {
                return partie.label === partieName;
            } ) : null;

            if ( !isNil( filterName ) && !isEmpty( filterName ) ) {
                showMessage( label.affaire.error15, 'danger' );
                setLoadingSave( false );
                return;
            }

            await updatePartieByDossier( accessToken, affaireId, partieName );

            updatePartie( partieName );

            setLoadingSave( false );
            showMessage( label.affaire.success8, 'primary' );
            toggleModal();
        }
    };
    const _createConseil = async () => {
        if ( isCreate === true ) {
            setLoadingSave( true );
            const accessToken = await getAccessTokenSilently();

            if ( isNil( partieName ) || partieName === '' ) {
                showMessage( label.etat.error8, 'danger' );
                setLoadingSave( false );
                return;
            }

            if ( isNil( partieName.label ) || partieName.label === '' ) {
                showMessage( label.etat.error6, 'danger' );
                setLoadingSave( false );
                return;
            }

            if ( isNil( partieName.email ) || partieName.email === '' ) {
                showMessage( label.etat.error5, 'danger' );
                setLoadingSave( false );
                return;
            }

            if ( !validateEmail( partieName.email ) ) {
                showMessage( label.affaire.error18, 'danger' );
                setLoadingSave( false );
                return;
            }

            // function by default
             forEach( functionIdItems, data => {
                 if ( isNil( partie ) ) {
                     // creation mediation
                     // lawfirm is id 11
                     if ( dossierType === 'MD' && data.value === 11 ) {
                         partieName.functionItem = new ItemDTO( {
                             value: data.value,
                             label: data.label
                         } );
                     }
                 }
             });

            if ( isNil( partieName.functionItem ) || partieName.functionItem === '' ) {
                showMessage( label.etat.error7, 'danger' );
                setLoadingSave( false );
                return;
            }
            // check if it exists
            const filterName = partiesCas ? filter( partiesCas, partie => {
                return partie.label === partieName;
            } ) : null;

            if ( !isNil( filterName ) && !isEmpty( filterName ) ) {
                showMessage( label.affaire.error15, 'danger' );
                setLoadingSave( false );
                return;
            }

            let result = null;

            // invite only NON litigant
            if ( !partieName.litigant ) {
                result = await inviteConseil( accessToken, affaireId, partieName );
            }

            if ( isNil( result ) || !result.error ) {
                if ( !partieName.litigant && !isNil( result ) ) {
                    partieName.vcKey = result.data;
                    partieName.type = 'litigant';
                } else {
                    partieName.type = 'other';

                }
                const resultCreation = await createConseilByDossier( accessToken, affaireId, partieName );

                if(resultCreation.error) {
                    showMessage( label.affaire.error21, 'danger' );
                    setLoadingSave( false );
                    return;
                }
                createPartie( partieName );
                // save is digital for this affaire

                setLoadingSave( false );
                showMessage( label.affaire.success8, 'primary' );
                toggleModal();
            } else {
                showMessage( label.affaire.error16, 'danger' );
                setLoadingSave( false );
                return;
            }

        }

    };

    return (
        <Modal size="md" isOpen={modal} toggle={toggleModal}>
            <ModalHeader>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                        onClick={toggleModal}>
                    <i className="tim-icons icon-simple-remove"></i>
                </button>
                {isCreate ? (
                    <h4 className="modal-title">{label.affaire.label32}</h4>
                ) : (
                    <h4 className="modal-title">{label.affaire.label39}</h4>
                )}
            </ModalHeader>
            <ModalBody>

                <Row>
                    <Col md="12">
                        <Label>{label.affaire.label33}</Label>
                        <FormGroup>
                            <Input
                                name="label"
                                componentClass="text"
                                onChange={( e ) => setPartieName( { ...partieName, label: e.target.value } )}
                                value={partieName.label}
                                placeholder={label.common.label14}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col md="12">
                        <Label>{label.affaire.label34}</Label>
                        <FormGroup>
                            <CreatableSelect
                                isDisabled={!isCreate}
                                menuPlacement="bottom"
                                value={partieName.emailItem}
                                className="react-select info"
                                classNamePrefix="react-select"
                                name="singleSelect"
                                onChange={( value ) => {
                                    if ( validateEmail( value.label ) ) {
                                        setPartieName( {
                                            ...partieName,
                                            emailItem: value,
                                            email: value.label
                                        } );
                                    } else {
                                        showMessage( label.affaire.error18, 'danger' );
                                    }

                                }}
                                options={users}
                                placeholder={label.common.label14}
                            />

                        </FormGroup>
                    </Col>
                </Row>

                {/* TYPE */}
                <Row>
                    <Col md="12">
                        <FormGroup check>
                            <Label check>
                                <Input
                                    defaultChecked={partieName.litigant}
                                    type="checkbox"
                                    onChange={( e ) => {
                                        setPartieName( {
                                            ...partieName,
                                            litigant: !partieName.litigant
                                        } );
                                    }}
                                />{' '}
                                <span className={`form-check-sign`}>
                                    <span className="check">{label.affaire.label38}</span>
                                </span>
                            </Label>
                        </FormGroup>
                    </Col>
                </Row>

                {/* ROLE */}
                {dossierType !== 'MD' ? (
                    <Row>
                        <Col md="12">
                            <Label>{label.affaire.label35}</Label>
                            <FormGroup>
                                <CreatableSelect
                                    isDisabled={partieName.functionItem ? partieName.functionItem.value === 12 : false }
                                    value={partieName.functionItem}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    name="singleSelect"
                                    onChange={( value ) => setPartieName( {
                                        ...partieName,
                                        functionItem: value,
                                        function: value.label
                                    } )}
                                    options={functionIdItems}
                                    placeholder={label.common.label14}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                ) : null}


            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>
                    {label.common.close}
                </Button> {' '}
                {isCreate === true ?
                    (
                        <Button color="primary" type="button" disabled={loadingSave}
                                onClick={_createConseil}
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '}{label.common.add}
                        </Button>
                    ) : (
                        <Button color="primary" type="button" disabled={loadingSave && isCreate}
                                onClick={_updatePartie}
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '}{label.common.update}
                        </Button>
                    )}

            </ModalFooter>
        </Modal>
    );
};