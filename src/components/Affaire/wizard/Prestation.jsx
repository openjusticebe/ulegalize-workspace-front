import React, { useEffect, useState } from 'react';
// reactstrap components
import {
    Button,
    ButtonGroup,
    CardSubtitle,
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
import PrestationSummary from '../../../model/prestation/PrestationSummary';
import DatePicker from 'react-datepicker';
import { useAuth0 } from '@auth0/auth0-react';
import { getTimesheetTypes, getUserResponsableList, getVats } from '../../../services/SearchService';
import Switch from 'react-bootstrap-switch';
import {
    createPrestation,
    getPrestationById,
    getPrestationDefault,
    updatePrestation
} from '../../../services/PresationService';
import moment from 'moment';
import 'moment/locale/fr';
import AsyncSelect from 'react-select/async/dist/react-select.esm';
import { getAffairesByVcUserIdAndSearchCriteria } from '../../../services/DossierService';

const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );

export const Prestation = ( props ) => {
    const [userResponsableList, setUserResponsableList] = useState( [] );
    const [loadingSave, setLoadingSave] = useState( false );
    const [prestation, setPrestation] = useState( new PrestationSummary() );
    const [timesheetType, setTimesheetType] = useState( [] );
    const [vat, setVat] = useState( [] );
    const { getAccessTokenSilently } = useAuth0();

    const { label, currency, isCreated, affaireId, vckeySelected } = props;

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            let result;
            if ( isCreated ) {
                result = await getPrestationDefault( accessToken );
            } else {
                result = await getPrestationById( accessToken, props.prestationId );
            }
            let data;
            if ( !result.error && !isNil( result.data ) ) {
                data = new PrestationSummary( result.data );
            } else {
                props.history.push( `/auth/unauthorized/` );
            }

            let resultTimesheet = await getTimesheetTypes( accessToken );
            let timesheetT = map( resultTimesheet.data, data => {

                if ( prestation.tsType === data.value ) {
                    prestation.tsTypeItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setTimesheetType( timesheetT );
            let resultVat = await getVats( accessToken );
            let vats = map( resultVat.data, data => {

                if ( prestation.vat === data.value ) {
                    prestation.vatItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setVat( vats );

            let resultUser = await getUserResponsableList( accessToken, vckeySelected );
            let profiles = map( resultUser.data, data => {

                if ( prestation.idGest === data.value ) {
                    prestation.idGestItem = new ItemDTO( data );
                }
                return new ItemDTO( data );
            } );
            setUserResponsableList( profiles );
            data.dossierId = affaireId;

            setPrestation( data );

        })();
    }, [getAccessTokenSilently] );

    const _savePrestation = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil(prestation.tsType) ) {
            setLoadingSave( false );
            props.showMessagePopupFrais( label.wizardFrais.error3, 'danger' );
            return;
        }
        if ( prestation.forfait === true ) {
            if ( isNil( prestation.forfaitHt ) || prestation.forfaitHt === 0 ) {
                setLoadingSave( false );
                props.showMessagePopupFrais( label.wizardFrais.error1, 'danger' );
                return;
            }

            // lawfirm

        } else {
            if ( (isNil( prestation.dh ) || prestation.dh === 0)
                && (isNil( prestation.dm ) || prestation.dm === 0) ) {
                setLoadingSave( false );
                props.showMessagePopupFrais( label.wizardFrais.error4, 'danger' );
                return;
            }
        }

        let result;
        if ( isCreated ) {
            result = await createPrestation( accessToken, prestation );
            if ( !result.error ) {
                props.done( null, label.wizardFrais.success1, 'primary' );
            } else {
                props.done( null, label.common.error1, 'danger' );
            }
        } else {
            result = await updatePrestation( accessToken, prestation );
            if ( !result.error ) {
                props.done( null, label.wizardFrais.successUpdate, 'primary' );
            } else {
                props.done( null, label.common.error2, 'danger' );
            }
        }
    };


    const _handleDossierChange = ( newValue ) => {
        setPrestation( {
            ...prestation,
            dossierId: newValue.value,
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

    const date = prestation.dateAction ? moment( prestation.dateAction ).toDate() : null;
    return (
        <>
            {isNil(affaireId) ? (
                <Row>
                    <Col lg="12">
                        <Label>{label.wizardFrais.label25}</Label>
                        <FormGroup>
                            <AsyncSelect
                                value={prestation.dossierItem}

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
                            value={prestation.tsTypeItem}
                            onChange={value => setPrestation( {
                                ...prestation,
                                tsType: value.value,
                                tsTypeItem: new ItemDTO( value )
                            } )
                            }
                            options={timesheetType}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label8}</Label>
                    <FormGroup>
                        <DatePicker
                            selected={date}
                            onChange={date => setPrestation( {
                                ...prestation,
                                dateAction: date,
                            } )
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
                    <Label>{label.wizardFrais.label9}</Label>
                    <FormGroup>
                        <Select
                            className="react-select info"
                            classNamePrefix="react-select"
                            name="singleSelect"
                            value={prestation.vatItem}
                            onChange={value => setPrestation( {
                                ...prestation,
                                vat: value.value,
                                vatItem: new ItemDTO( value )
                            } )
                            }
                            options={vat}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="10">
                    <CardSubtitle>{label.wizardFrais.label11}</CardSubtitle>
                    <Switch
                        value={prestation.forfait}
                        defaultValue={prestation.forfait}
                        offColor="primary"
                        onText={label.wizardFrais.label12}
                        onColor="primary"
                        offText={label.wizardFrais.label14}
                        onChange={value => setPrestation( {
                            ...prestation,
                            forfait: !prestation.forfait,
                        } )
                        }
                    />{' '}
                </Col>
            </Row>
            {prestation.forfait ? (
                <>
                    <Row>
                        <Col md="10">
                            <Label>{label.wizardFrais.label15}</Label>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText><span
                                        className="currency-input-text">{currency}</span></InputGroupText>
                                </InputGroupAddon>
                                <Input step=".01"
                                       value={prestation.forfaitHt}
                                       type="number"
                                       onChange={event => {
                                           setPrestation( { ...prestation, forfaitHt: event.target.value } );
                                       }}
                                       id="inputCosthour"
                                       placeholder={label.wizardFrais.label15}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </>
            ) : (
                <>
                    <Row>
                        <Col md="10">
                            <Label>{label.wizardFrais.label16}</Label>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText><span
                                        className="currency-input-text">{currency}</span></InputGroupText>
                                </InputGroupAddon>
                                <Input step=".01"
                                       value={prestation.couthoraire}
                                       type="number"
                                       onChange={event => {
                                           setPrestation( { ...prestation, couthoraire: event.target.value } );
                                       }}
                                       id="inputCosthour"
                                       placeholder={label.wizardFrais.label16}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="6">
                            <Label>{label.wizardFrais.label19}</Label>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText><i className="fa fa-clock"></i></InputGroupText>
                                </InputGroupAddon>
                                <Input step="."
                                       value={prestation.dh}
                                       type="number"
                                       onChange={event => {
                                           setPrestation( { ...prestation, dh: event.target.value } );
                                       }}
                                       id="inputCosthour"
                                       placeholder={label.wizardFrais.label19}
                                />
                            </InputGroup>
                        </Col>
                        <Col md="6">
                            <Label>{label.wizardFrais.label20}</Label>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText><i className="fa fa-clock"></i></InputGroupText>
                                </InputGroupAddon>
                                <Input step="."
                                       value={prestation.dm}
                                       type="number"
                                       onChange={event => {
                                           setPrestation( { ...prestation, dm: event.target.value } );
                                       }}
                                       id="inputCosthour"
                                       placeholder={label.wizardFrais.label20}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </>
            )}
            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label17}</Label>
                    <FormGroup>
                        <Select
                            value={prestation.idGestItem}
                            className="react-select info"
                            classNamePrefix="react-select"
                            name="singleSelect"
                            onChange={value => setPrestation( {
                                ...prestation,
                                idGestItem: value,
                                idGest: value.value
                            } )}
                            options={userResponsableList}
                            placeholder={label.wizardFrais.label17}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="10">
                    <Label>{label.wizardFrais.label18}</Label>
                    <FormGroup>
                        <Input type="textarea"
                               value={prestation.comment}
                               onChange={e => setPrestation(
                                   { ...prestation, comment: e.target.value } )}
                               placeholder={label.wizardFrais.label18}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="margin-bottom-15" md={{ offset: 7, size: 4 }} sm={{ offset: 7, size: 5 }}>
                    <ButtonGroup>
                        <Button color="primary" type="button" disabled={loadingSave}
                                onClick={_savePrestation}
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '}
                            {props.isCreated ? (label.common.save) : (label.common.update)}
                        </Button>

                    </ButtonGroup>
                </Col>
            </Row>
        </>
    );
};

