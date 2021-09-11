import React, { useRef, useState } from 'react';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap';

import moment from 'moment';
import 'moment/locale/fr';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import { useAuth0 } from '@auth0/auth0-react';
import { FraisAdmin } from './wizard/FraisAdmin';
import { createFrais } from '../../services/FraisAdminService';
import FraisAdminDTO from '../../model/fraisadmin/FraisAdminDTO';
import { createDossierTransparency } from '../../services/transparency/CaseService';
import LawfirmCalendarEventDTO from '../../model/agenda/LawfirmCalendarEventDTO';
import { getDossierById, switchDossierDigital } from '../../services/DossierService';
import DossierDTO from '../../model/affaire/DossierDTO';
import CaseCreationDTO from '../../model/affaire/CaseCreationDTO';

const isNil = require( 'lodash/isNil' );
moment.locale( 'fr' );
registerLocale( 'fr', fr );

export const CommunicateWithModal = ( {
                                          modal,
                                          label,
                                          affaireId,
                                          vckeySelected,
                                          showMessage,
                                          clientList,
                                          language,
                                          toggleModal,
                                      } ) => {
    const { getAccessTokenSilently } = useAuth0();
    const [showFraisAdmin, setShowFraisAdmin] = useState( false );
    const [loadingSave, setLoadingSave] = useState( false );
    const fraisAdminDTO = useRef( new FraisAdminDTO() );

    const _saveFraisAdmin = async ( value ) => {
        fraisAdminDTO.current = value;
    };

    const _createCommunication = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();
        let data = new LawfirmCalendarEventDTO();

        const resultDossier = await getDossierById( accessToken, affaireId, vckeySelected );

        if ( resultDossier.error ) {
            showMessage( label.affaire.error4, 'danger' );
            setLoadingSave( false );

            return;
        }

        data.contact = clientList;
        data.dossier = new DossierDTO( resultDossier.data );

        // create frais admin
        if ( showFraisAdmin ) {
            if ( isNil( fraisAdminDTO.current.idDebourType ) ) {
                setLoadingSave( false );
                showMessage( label.wizardFrais.error3, 'danger' );
                return;

            }
            fraisAdminDTO.current.idDoss = affaireId;

            let result = await createFrais( accessToken, fraisAdminDTO.current );

            if ( !result.error ) {
                showMessage( label.wizardFrais.success2, 'primary' );
            } else {
                showMessage( label.common.error1, 'danger' );
                return;
            }
        }

        // save transparency create case
        //data.contact.birthdate = moment( data.contact.birthdate ).toDate()
        const caseCreation = new CaseCreationDTO( data.dossier, clientList );
        let resultatCas = await createDossierTransparency( accessToken, caseCreation );
        if ( resultatCas.error ) {
            showMessage( label.etat.error1, 'danger' );
            setLoadingSave( false );

            return;
        }

        // save is digital for this affaire
        await switchDossierDigital( accessToken, data.dossier.id );

        // load stripe if it's paid option

        if ( !resultatCas.error ) {
            showMessage( label.etat.success1, 'primary' );
        }
        toggleModal();
    };
    return (
        <Modal size="md" style={{ width: 'fit-content' }} isOpen={modal} toggle={toggleModal}>
            <ModalHeader>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                        onClick={toggleModal}>
                    <i className="tim-icons icon-simple-remove"></i>
                </button>
                <h4 className="modal-title">{label.etat.transparencyModalLabel}</h4>
            </ModalHeader>
            <ModalBody>
                <Row>

                    <FormGroup check>
                        <Label check>
                            <Input
                                defaultChecked={false}
                                onChange={( e ) => setShowFraisAdmin( !showFraisAdmin )}
                                type="checkbox"
                            />{' '}
                            <span className={`form-check-sign form-check-sign`}>
                                <span
                                    className="check">{label.etat.isAddMessageFraisAdmin}</span>
                            </span>
                        </Label>
                    </FormGroup>
                </Row>
                {showFraisAdmin ? (
                    <FraisAdmin
                        showMessagePopupFrais={showMessage}
                        externalUse={true}
                        externalUseFrais={_saveFraisAdmin}
                        isCreated={true}
                        affaireId={affaireId}
                        label={label}
                        done={showMessage}
                        language={language}/>
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>
                    {label.common.close}
                </Button> {' '}
                <Button color="primary" type="button" disabled={loadingSave}
                        onClick={_createCommunication}
                >
                    {loadingSave ? (
                        <Spinner
                            size="sm"
                            color="secondary"
                        />
                    ) : null}
                    {' '}{label.common.save}
                </Button>
            </ModalFooter>
        </Modal>
    );
};