import React, { useEffect, useState } from 'react';
// reactstrap components
import {
    Button,
    ButtonGroup,
    Col,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Label,
    Row,
    Spinner
} from 'reactstrap';
import Select from 'react-select';
import ItemDTO from '../../../model/ItemDTO';
import DatePicker from 'react-datepicker';
import { useAuth0 } from '@auth0/auth0-react';
import { getDeboursType } from '../../../services/SearchService';
import moment from 'moment';
import 'moment/locale/fr';
import {
    createFrais,
    getFraisById,
    getFraisDefault,
    getFraisMatiere,
    updateFrais
} from '../../../services/FraisAdminService';
import FraisAdminDTO from '../../../model/fraisadmin/FraisAdminDTO';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getAffairesByVcUserIdAndSearchCriteria } from '../../../services/DossierService';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const round = require( 'lodash/round' );

/**
 *
 * @param label
 * @param fraisAdminId
 * @param isCreated
 * @param affaireId
 * @param externalUse  : when user want to save it externally and not with save button below
 * @param externalUseFrais  : method to set "ref" outside the component
 * @param history
 * @param showMessagePopupFrais
 * @param done
 * @returns {JSX.Element}
 * @constructor
 */
export const FraisAdmin = ( { label, fraisAdminId, isCreated, affaireId, externalUse, externalUseFrais, history, showMessagePopupFrais, done } ) => {
    const [loadingSave, setLoadingSave] = useState( false );
    const [fraisAdminDTO, setFraisAdminDTO] = useState( new FraisAdminDTO() );
    const [debourType, setDebourType] = useState( [] );
    const { getAccessTokenSilently } = useAuth0();

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let result;
            if ( isCreated ) {
                result = await getFraisDefault( accessToken );
            } else {
                result = await getFraisById( accessToken, fraisAdminId );
            }
            let data;
            let cost;
            if ( !result.error && !isNil( result.data ) ) {
                data = new FraisAdminDTO( result.data );
                cost = parseFloat( data.pricePerUnit ) * parseFloat( data.unit );
                data.costCalculated = round( cost, 2 ).toFixed( 2 );
            } else {
                history.push( { pathname: `/auth/unauthorized/` } );
            }

            let resultTimesheet = await getDeboursType( accessToken );
            let timesheetT = map( resultTimesheet.data, type => {

                if ( data.idDebourType === type.value ) {
                    data.idDebourTypeItem = new ItemDTO( type );
                }
                return new ItemDTO( type );
            } );
            setDebourType( timesheetT );

            data.idDoss = affaireId;

            setFraisAdminDTO( data );
            if(externalUse) {
                externalUseFrais(data);
            }

        })();
    }, [getAccessTokenSilently] );

    const _saveFraisAdmin = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( fraisAdminDTO.idDebourType ) ) {
            setLoadingSave( false );
            showMessagePopupFrais( label.wizardFrais.error3, 'danger' );
            return;

        }

        let result;
        if ( isCreated ) {
            result = await createFrais( accessToken, fraisAdminDTO );

            if ( !result.error ) {
                done( null, label.wizardFrais.success2, 'primary' );
            } else {
                done( null, label.common.error1, 'danger' );
            }
        } else {
            result = await updateFrais( accessToken, fraisAdminDTO );

            if ( !result.error ) {
                done( null, label.wizardFrais.success4, 'primary' );
            } else {
                done( null, label.common.error2, 'danger' );
            }
        }

    };
    const _handleDossierChange = ( newValue ) => {
        setFraisAdminDTO( {
            ...fraisAdminDTO,
            idDoss: newValue.value,
            dossierItem: new ItemDTO( newValue )
        } );
    };

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

    const date = fraisAdminDTO.dateAction ? moment( fraisAdminDTO.dateAction ).toDate() : null;
    return (
        <>
            {isNil(affaireId) ? (
                <Row>
                    <Col lg="12">
                        <Label>{label.wizardFrais.label25}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={fraisAdminDTO.dossierItem}

                                className="react-select info"
                                classNamePrefix="react-select"
                                cacheOptions
                                loadOptions={_loadDossierOptions}
                                defaultOptions
                                onChange={_handleDossierChange}
                                placeholder={label.appointmentmodalpanel.label16}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            ): null}

            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label7}</Label>
                    <FormGroup>
                        <Select
                            className="react-select info"
                            classNamePrefix="react-select"
                            name="singleSelect"
                            value={fraisAdminDTO.idDebourTypeItem}
                            onChange={async value => {
                                const accessToken = await getAccessTokenSilently();
                                const result = await getFraisMatiere( accessToken, value.value );
                                let cost = parseFloat( result.data.pricePerUnit ) * parseFloat( fraisAdminDTO.unit );
                                cost = round( cost, 2 ).toFixed( 2 );
                                if ( !result.error ) {
                                    const fraisUpdated = {
                                        ...fraisAdminDTO,
                                        idMesureType: result.data.idMesureType,
                                        mesureDescription: result.data.mesureDescription,
                                        pricePerUnit: result.data.pricePerUnit,
                                        idDebourType: value.value,
                                        idDebourTypeItem: new ItemDTO( value ),
                                        costCalculated: cost
                                    };
                                    setFraisAdminDTO( fraisUpdated );
                                    if(externalUse) {
                                        externalUseFrais(fraisUpdated);
                                    }
                                }
                            }
                            }
                            options={debourType}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="6">
                    <Label>{label.wizardFrais.label21} {' : '} {fraisAdminDTO.mesureDescription}</Label>
                </Col>
                <Col md="6">
                    <Label>{label.wizardFrais.label22} {' : '} {fraisAdminDTO.pricePerUnit}</Label>
                </Col>
                <Col md="6">
                    <Label>{label.wizardFrais.label23} {' : '} {fraisAdminDTO.costCalculated}</Label>
                </Col>
            </Row>
            <Row>
                <Col md="6">
                    <Label>{label.wizardFrais.label24}</Label>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <InputGroupText><span
                                className="currency-input-text">U</span></InputGroupText>
                        </InputGroupAddon>
                        <Input step="."
                               value={fraisAdminDTO.unit}
                               type="number"
                               onChange={event => {
                                   let cost = parseFloat(fraisAdminDTO.pricePerUnit) * parseFloat(event.target.value);
                                   cost = round( cost, 2 ).toFixed( 2 );
                                   let fraisUpdated = {
                                       ...fraisAdminDTO,
                                       unit: event.target.value,
                                       costCalculated: cost
                                   };
                                   setFraisAdminDTO( fraisUpdated );
                                   if(externalUse) {
                                       externalUseFrais(fraisUpdated);
                                   }
                               }}
                               id="inputUnithour"
                               placeholder={label.wizardFrais.label24}
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label8}</Label>
                    <FormGroup>
                        <DatePicker
                            selected={date}
                            onChange={date => {
                                let fraisUpdated = {
                                    ...fraisAdminDTO,
                                    dateAction: date,
                                };

                                    setFraisAdminDTO( fraisUpdated );
                                if(externalUse) {
                                    externalUseFrais(fraisUpdated);
                                }
                            }
                            }
                            locale="fr"
                            timeCaption="date"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-mm-dd"
                            className="form-control color-primary"
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label18}</Label>
                    <FormGroup>
                        <Input type="textarea"
                               value={fraisAdminDTO.comment}
                               onChange={e => {
                                   let fraisUpdated = { ...fraisAdminDTO, comment: e.target.value };

                                   setFraisAdminDTO( fraisUpdated );
                                   if(externalUse) {
                                       externalUseFrais(fraisUpdated);
                                   }
                               }
                               }
                               placeholder={label.wizardFrais.label18}
                        />
                    </FormGroup>
                </Col>
            </Row>
            {!externalUse ? (
                <Row>
                    <Col className="margin-bottom-15" md={{ offset: 7, size: 4 }} sm={{ offset: 7, size: 5 }}>
                        <ButtonGroup>
                            {isCreated ? (
                                <Button color="primary" type="button" disabled={loadingSave}
                                        onClick={_saveFraisAdmin}
                                >
                                    {loadingSave ? (
                                        <Spinner
                                            size="sm"
                                            color="secondary"
                                        />
                                    ) : null}
                                    {' '}{label.common.save}
                                </Button>
                            ) : (
                                <Button color="primary" type="button"
                                        onClick={_saveFraisAdmin}
                                        disabled={loadingSave}
                                >

                                    {label.common.update}
                                </Button>
                            )}
                        </ButtonGroup>
                    </Col>
                </Row>
            ): null}

        </>
    );
};

