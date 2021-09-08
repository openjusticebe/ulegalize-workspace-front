import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Col,
    Form,
    FormGroup,
    FormText,
    Label,
    ListGroup,
    PopoverBody,
    PopoverHeader,
    Row,
    Spinner,
    UncontrolledPopover,
    UncontrolledTooltip
} from 'reactstrap';
import ModalUploadSignDocument from './popup/ModalUploadSignDocument';
import ModalNoActivePayment from './popup/ModalNoActivePayment';
import { CustomPopover } from './StatusQuestionPopup';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import CreateIcon from '@material-ui/icons/Create';
import GetApp from '@material-ui/icons/GetApp';
import HelpIcon from '@material-ui/icons/Help';
import { useAuth0 } from '@auth0/auth0-react';
import { getCasByDossierIdAndPartie, updateCase } from '../../services/transparency/CaseService';
import ModalUploadBasicDocument from './popup/ModalUploadBasicDocument';
import { getDateDetails } from '../../utils/DateUtils';
import CasDTO from '../../model/affaire/CasDTO';
import { ConseilModal } from './popup/ConseilModal';
import { checkPaymentActivated } from '../../services/PaymentServices';

const map = require( 'lodash/map' );
const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );


export default function CasJuridiqueForm( {
                                              showSaveButton,
                                              partie,
                                              updatePartie,
                                              dossierType,
                                              clientId,
                                              affaireId, attachEsignDocument, updateCaseRef,
                                              downloadFile, lg, md, label, language, emailPayUser, enumRights,
                                              userId, vckeySelected, fullName,
                                              attachFileCase, cas, isLoadingSave,
                                              showMessagePopup
                                          } ) {

    const { getAccessTokenSilently } = useAuth0();
    const [isLoading, setIsLoading] = useState( false );
    const [modalUploadSignDocument, setModalUploadSignDocument] = useState( false );
    const [modalUploadBasicDocument, setModalUploadBasicDocument] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const [caseDossier, setCaseDossier] = useState( new CasDTO() );
    const [openModalConseil, setOpenModalConseil] = useState( null );
    const payment = useRef( false );
    const localUpdateCaseRef = useRef( false );
    // transparency
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            if ( !isNil( affaireId ) ) {
                const partieEmail = partie ? partie.email : null;
                const resultCase = await getCasByDossierIdAndPartie( accessToken, affaireId, partieEmail );
                if ( (isNil( resultCase.error ) || !resultCase.error) && !isNil( resultCase.data ) ) {
                    setCaseDossier( resultCase.data[ 0 ] );
                } else {
                    setCaseDossier( null );
                }
            } else {
                setCaseDossier( cas );
            }

        })();
    }, [getAccessTokenSilently, updateCaseRef, localUpdateCaseRef.current] );

    const _toggleBasicCheckPayment = () => {
        _basicUpload();
    };

    const _toggleUsignCheckPayment = async () => {
        const accessToken = await getAccessTokenSilently();

        // get payment
        let resultPayment = await checkPaymentActivated( accessToken );

        if ( !isNil( resultPayment.data ) && resultPayment.data === true ) {
            payment.current = true;

            _usignUpload();
        } else {
            setModalNotPaidSignDocument( !modalNotPaidSignDocument );
        }
    };

    const _toggleModalUploadBasicDocument = () => {
        setModalUploadBasicDocument( !modalUploadBasicDocument );
    };

    const _toggleModaNPlUploadSignDocument = () => {
        setModalNotPaidSignDocument( !modalNotPaidSignDocument );
    };

    const _basicUpload = () => {
        setModalUploadBasicDocument( !modalUploadBasicDocument );
    };

    const _usignUpload = () => {
        setModalUploadSignDocument( !modalUploadSignDocument );
    };

    const _attachFile = ( files ) => {
        attachFileCase( files );
    };
    const _attachEsignDocument = ( files ) => {
        attachEsignDocument( files );
    };

    const handleDownloadFile = async ( caseId, filename ) => {
        downloadFile( caseId, filename );
    };

    const _updateCase = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        const result = await updateCase( accessToken, caseDossier );

        if ( !result.error ) {
            showMessagePopup( label.common.success1, 'primary' );
        } else {
            showMessagePopup( label.common.error1, 'danger' );
        }

        localUpdateCaseRef.current = !localUpdateCaseRef.current;

        setIsLoading( false );

    };
    const _conseilUpdated = async () => {
        setIsLoading( true );

        localUpdateCaseRef.current = !localUpdateCaseRef.current;
        updatePartie();
        setIsLoading( false );
    };

    // something wrong because the dossier is digital in mysql
    if ( isNil( caseDossier ) ) {
        return (
            <Row>
                <Col lg={lg} md={md} sm={12} xs={12}>
                    <p className="blockquote blockquote-primary">
                        {label.casJuridiqueForm.error1}
                    </p>
                </Col>
            </Row>
        );
    }

    let email = '';

    if ( caseDossier.username && isNil( partie ) ) {
        email = caseDossier.username.email;
    } else if ( !isNil( partie ) ) {
        email = partie.email;
    }

    const filesTemp = caseDossier.filesStored && !isEmpty( caseDossier.filesStored ) ?
        map( caseDossier.filesStored, file => {
            let statusGlyph = (<Col sm={1} md={1}>
                <Button
                    outline
                    color="info"
                    type="button"
                    id={`PopoverNormal-${file.requestId}`}
                    className="no-border btn-icon">
                    <ErrorOutlineOutlinedIcon/>
                </Button>
                <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${file.requestId}`}>
                    <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                    <PopoverBody>
                        <CustomPopover label={label}/>
                    </PopoverBody>
                </UncontrolledPopover>
            </Col>);
            if ( file.status === 'SIGN' ) {
                statusGlyph = (<Col sm={1} md={1}>
                    <Button
                        outline
                        color="info"
                        type="button"
                        id={`PopoverSign-${file.requestId}`}
                        className="no-border btn-icon">
                        <CreateIcon className="green"/>
                    </Button>
                    <UncontrolledPopover trigger="focus" placement="left" target={`PopoverSign-${file.requestId}`}>
                        <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                        <PopoverBody>
                            <CustomPopover label={label}/>
                        </PopoverBody>
                    </UncontrolledPopover>
                </Col>);
            } else if ( file.status === 'WAITING' ) {
                statusGlyph = (<Col sm={1} md={1}>
                    <Button
                        outline
                        color="info"
                        type="button"
                        id={`PopoverStart-${file.requestId}`}
                        className="no-border btn-icon">
                        <CreateIcon className="red glyphicon-ring"/>
                    </Button>
                    <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${file.requestId}`}>
                        <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                        <PopoverBody>
                            <CustomPopover label={label}/>
                        </PopoverBody>
                    </UncontrolledPopover>
                </Col>);
            } else if ( file.status === 'START' ) {
                statusGlyph = (<Col sm={1} md={1}>
                    <Button
                        outline
                        color="info"
                        type="button"
                        id={`PopoverStart-${file.requestId}`}
                        className="no-border btn-icon">
                        <CreateIcon className="red glyphicon-ring"/>
                    </Button>
                    <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${file.requestId}`}>
                        <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                        <PopoverBody>
                            <CustomPopover label={label}/>
                        </PopoverBody>
                    </UncontrolledPopover>
                </Col>);
            } else if ( file.status === 'NORMAL' ) {
                statusGlyph = (<Col sm={1} md={1}>
                    <Button
                        outline
                        color="info"
                        type="button"
                        id={`PopoverNormal-${file.requestId}`}
                        size="sm"
                        className="no-border btn-icon">
                        <ErrorOutlineOutlinedIcon/>
                    </Button>
                    <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${file.requestId}`}>
                        <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                        <PopoverBody>
                            <CustomPopover label={label}/>
                        </PopoverBody>
                    </UncontrolledPopover>
                </Col>);
            }
            return (
                <li className="list-group-item" key={file.requestId}>
                    <Row>
                        {statusGlyph}
                        <Col sm={{ size: 8, offset: 1 }} md={{ size: 8, offset: 1 }}>
                            {file.value}
                            <FormText
                                color="muted">{file.recDate ? getDateDetails( file.recDate ) : ''
                            } / {file.recUser}</FormText>
                        </Col>
                        <Col sm={1} md={1}>
                            <Button
                                size="sm"
                                color="primary"
                                disabled={file.status === 'WAITING'}
                                className="btn-icon"
                                onClick={() => handleDownloadFile( caseDossier.id, file )}>
                                <GetApp/>
                            </Button>
                        </Col>
                        {file.status === 'WAITING' ? (<FormText>
                            {label.casJuridiqueForm.waiting}
                        </FormText>): null}
                    </Row>
                </li>
            );
        } ) : null;

    const _toggleCreateConseil = async (e, partie) => {
        if ( isNil( partie ) ) {
            setOpenModalConseil( null );
        } else {
            setOpenModalConseil( partie );

        }
    };
    let nb = 0;
    return (
        <Row>
            <Col lg={12} md={12} sm={12} xs={12}>
                <Form horizontal>
                    {/* PARTIE INFO*/}
                    {caseDossier.partieEmail ? map( caseDossier.partieEmail, partie => {
                        nb++;
                        return partie.email !== email && (partie.type !== 'creator' )? (
                            <Row>
                                <Label md="3" id={`tooltip-lbl-email${nb}`}>{partie.label} </Label>
                                <UncontrolledTooltip placement="top" target={`tooltip-lbl-email${nb}`} trigger="click">
                                    {caseDossier.id}
                                </UncontrolledTooltip>
                                <Col md="8">
                                    <FormGroup>
                                        <input className="form-control"
                                               disabled={true}
                                               value={partie.email}
                                               type="email"/>
                                    </FormGroup>
                                </Col>
                                {/* PARTIE INFO */}
                                <Col md="1">
                                    <Button
                                        className="btn-icon float-right"
                                        color="primary"
                                        type="button"
                                        size="sm"
                                        onClick={(e) => _toggleCreateConseil(e, partie )}
                                    >
                                        <i className="tim-icons icon-pencil"/>
                                    </Button>
                                </Col>
                                {/* OPEN TO CREATE A CONSEIL  */}
                                {!isNil( openModalConseil ) ?
                                    (
                                        <ConseilModal
                                            isCreate={false}
                                            partie={openModalConseil}
                                            dossierType={dossierType}
                                            partiesCas={null}
                                            updatePartie={_conseilUpdated}
                                            label={label}
                                            affaireId={affaireId}
                                            modal={!isNil( openModalConseil )}
                                            toggleModal={_toggleCreateConseil}
                                            showMessage={showMessagePopup}
                                        />
                                    ) : null}
                            </Row>) : null;
                    } ) : null}

                    <Row>
                        <Label md="2"/>
                        <Col lg={10} md={10} sm={10}>
                            <Button color="default"
                                    block={true}
                                    disabled={isLoading || isLoadingSave}
                                    onClick={_toggleBasicCheckPayment}
                                    style={{ marginBottom: '1rem' }}>
                                {isLoading ? 'Loading ...' : label.casJuridiqueForm.label102}
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Label md="2"/>
                        <Col lg={10} md={10} sm={10}>
                            {!isNil( affaireId ) ? (
                                <Button color="primary"
                                        block={true}
                                        disabled={isLoading || isLoadingSave}
                                        onClick={_toggleUsignCheckPayment}
                                        style={{ marginBottom: '1rem' }}>
                                    {isLoading ? 'Loading ...' : label.casJuridiqueForm.label103}
                                </Button>
                            ) : null}
                        </Col>
                    </Row>
                    <Row>
                        <Label for="exampleFiles" sm={2}>{label.casJuridiqueForm.label4} {' '}
                            <Button
                                type="button"
                                size="sm"
                                outline
                                id="PopoverFocus"
                                className="marginLeft10 btn-icon">
                                <HelpIcon></HelpIcon>
                            </Button>
                        </Label>
                        <UncontrolledPopover trigger="focus" placement="left" target="PopoverFocus">
                            <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                            <PopoverBody>
                                <CustomPopover label={label}/>
                            </PopoverBody>
                        </UncontrolledPopover>
                        <Col lg={9} md={9} sm={10}>
                            <ListGroup>
                                {filesTemp}
                            </ListGroup>
                        </Col>
                    </Row>
                    {showSaveButton ? (
                        <Row>
                            <Col lg={{ offset: 8, size: 4 }} md={{ offset: 8, size: 4 }} sm={{ size: 5 }}>
                                <Button color="primary" type="button" disabled={isLoading || isLoadingSave}
                                        onClick={_updateCase}
                                >
                                    {isLoading || isLoadingSave ? (
                                        <Spinner
                                            size="sm"
                                            color="secondary"
                                        />
                                    ) : null}
                                    {' '} {label.common.save}
                                </Button>
                            </Col>
                        </Row>
                    ): null}

                </Form>

                {modalUploadBasicDocument ? (
                    <ModalUploadBasicDocument
                        cas={caseDossier}
                        vckeySelected={vckeySelected}
                        affaireId={affaireId}
                        attachFile={_attachFile}
                        label={label}
                        toggleModalDetails={_toggleModalUploadBasicDocument}
                        modalDisplay={modalUploadBasicDocument}/>
                ) : null}
                {modalNotPaidSignDocument ? (
                    <ModalNoActivePayment
                        label={label}
                        toggleModalDetails={_toggleModaNPlUploadSignDocument}
                        modalDisplay={modalNotPaidSignDocument}/>
                ) : null}
                {modalUploadSignDocument ? (
                    <ModalUploadSignDocument
                        showMessagePopup={showMessagePopup}
                        affaireId={affaireId}
                        vckeySelected={vckeySelected}
                        cas={caseDossier}
                        label={label}
                        payment={payment.current}
                        toggleModalDetails={_usignUpload}
                        attachEsignDocument={_attachEsignDocument}
                        modalDisplay={modalUploadSignDocument}/>
                ) : null}
            </Col>

        </Row>
    );
}

