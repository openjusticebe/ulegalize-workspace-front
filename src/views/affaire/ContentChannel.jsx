import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Col,
    Collapse,
    Form,
    FormGroup,
    FormText,
    Input,
    Label,
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
import { updateChannel } from '../../services/transparency/CaseService';
import ModalUploadBasicDocument from './popup/ModalUploadBasicDocument';
import { getDateDetails } from '../../utils/DateUtils';
import { ConseilModal } from './popup/ConseilModal';
import Comments from '../../model/affaire/Comments';
import { checkPaymentActivated } from '../../services/PaymentServices';

const orderBy = require( 'lodash/orderBy' );
const map = require( 'lodash/map' );
const last = require( 'lodash/last' );
const slice = require( 'lodash/slice' );
const size = require( 'lodash/size' );
const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );

//const find = require( 'lodash/find' );

const MAX_COMMENT = 1;
const MAX_ATTACHED = 1;

export default function ContentChannel( {
                                            channel,
                                            dossierType,
                                            affaireId,
                                            vckeySelected,
                                            attachEsignDocumentChannel,
                                            channelUpdated,
                                            downloadFile,
                                            lg, md,
                                            label,
                                            attachFileCase,
                                            isLoadingSave,
                                            showMessagePopup
                                        } ) {

    const { getAccessTokenSilently } = useAuth0();
    const [isLoading, setIsLoading] = useState( false );
    const [modalUploadSignDocument, setModalUploadSignDocument] = useState( false );
    const [modalUploadBasicDocument, setModalUploadBasicDocument] = useState( false );
    const [modalNotPaidSignDocument, setModalNotPaidSignDocument] = useState( false );
    const [collapseComments, setCollapseComments] = useState( false );
    const [collapseFiles, setCollapseFiles] = useState( false );
    const [channelContent, setChannelContent] = useState( channel );
    const [openModalConseil, setOpenModalConseil] = useState( null );
    const payment = useRef( false );

    // transparency
    useEffect( () => {
        (async () => {
            setChannelContent( channel );
        })();
    }, [channel] );

    const _toggleComments = () => {
        setCollapseComments( !collapseComments );
    };
    const _toggleFiles = () => {
        setCollapseFiles( !collapseFiles );
    };
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

    const _updateCommentCas = ( e ) => {
        // order comment first is the first comment inserted
        let commentsTemp = orderBy( channelContent.comments, ['order'] );

        if ( commentsTemp && isEmpty( commentsTemp ) ) {
            commentsTemp.push( new Comments() );
        }

        // object comment for the answer
        let commentAnswer = last( commentsTemp );

        commentAnswer.message = e.target.value;

        //commentsTemp = [...commentsTemp, commentAnswer];

        setChannelContent( { ...channelContent, comments: commentsTemp } );
    };

    const _attachFile = ( files ) => {
        // remove casId for channelId
        files.delete( 'casId' );
        files.append( 'channelId', channel.id );
        files.append( 'affaireId', affaireId );

        attachFileCase( files );
    };
    const _attachEsignDocument = ( files ) => {
        // remove casId for channelId
        files.append( 'channelId', channel.id );
        files.append( 'affaireId', affaireId );

        attachEsignDocumentChannel( files );
    };

    const handleDownloadFile = async ( channelId, filename ) => {
        downloadFile( channelId, filename );
    };

    const _updateChannel = async () => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();
        const result = await updateChannel( accessToken, channelContent );

        if ( !result.error ) {
            showMessagePopup( label.common.success1, 'primary' );
        } else {
            showMessagePopup( label.common.error1, 'danger' );
        }

        channelUpdated();

        setIsLoading( false );

    };
    const _toggleCreateConseil = async ( e, partie ) => {
        if ( isNil( partie ) ) {
            setOpenModalConseil( null );
        } else {
            setOpenModalConseil( partie );

        }
    };

    // something wrong because the dossier is digital in mysql
    if ( isNil( channelContent ) ) {
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

    // last 2 comments displayed
    let commentsList;
    // Old comments: if the comments list > 2 , old are shwon into "More ... " link
    let commentsListOld;
    let commentsListOldComponents;
    let tooltipId = 0;

    // order comment first is the first comment inserted
    const commentsTemp = orderBy( channelContent.comments, ['order'] );

    // remove the last item because it's an empty object for the answer
    const sizeComment = size( channelContent.comments );

    // less than MAX_COMMENT, display all coments
    //if ( sizeComment === 1 ) {
    //    commentsList = commentsTemp;
    //} else
    if ( MAX_COMMENT >= size( channelContent.comments ) - 1 ) {
        commentsList = slice( commentsTemp, 0, sizeComment - 1 );
    } else {
        commentsList = slice( commentsTemp, sizeComment - MAX_COMMENT - 1, sizeComment - 1 );
        commentsListOld = slice( commentsTemp, 0, sizeComment - MAX_COMMENT - 1 );
        commentsListOldComponents = map( commentsListOld, comment => {
            tooltipId++;
            const formatDate = getDateDetails( comment.recDate );

            return (

                <Row key={comment.order}>
                    <Label md={2}>{comment.order}. {label.casJuridiqueForm.label15} </Label>
                    <Col lg={8} md={8} sm={10} id={'Tooltip-chan-' + tooltipId}>
                        <FormGroup>
                            <Input
                                value={comment.message}
                                component="textarea"
                                className="form-control"
                                disabled
                            />
                            <FormText color="muted">
                                {comment.userType} , {formatDate}
                            </FormText>
                            <UncontrolledTooltip placement="bottom" target={'Tooltip-chan-' + tooltipId}>
                                {comment.message}
                            </UncontrolledTooltip>
                        </FormGroup>
                    </Col>
                </Row>

            );
        } );
    }

    // last 2 files displayed
    let filesList;
    // Old files: if the file list > 2 , old are shwon into "More ... " link
    let filesListOld;
    let filesListOldComponents;
    const sizeFile = size( channelContent.filesStored );
    const filesTemp = orderBy( channelContent.filesStored, ['recDate'] );

    if ( MAX_ATTACHED >= size( channelContent.filesStored ) ) {
        filesList = slice( filesTemp, 0, sizeFile  );
    } else {
        filesList = slice( filesTemp, sizeFile - MAX_ATTACHED, sizeFile );
        filesListOld = slice( filesTemp, 0, sizeFile - MAX_ATTACHED );
        filesListOldComponents = map( filesListOld, file => {
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
                                className="btn-icon"
                                disabled={file.status === 'WAITING'}
                                onClick={() => handleDownloadFile( channelContent.id, file )}>
                                <GetApp/>
                            </Button>
                        </Col>
                        {file.status === 'WAITING' ? (<FormText>
                            {label.casJuridiqueForm.waiting}
                        </FormText>) : null}
                    </Row>
                </li>
            );
        } );
    }

    //const filesTemp = channelContent.filesStored && !isEmpty( channelContent.filesStored ) ?
    //    map( channelContent.filesStored, file => {
    //        let statusGlyph = (<Col sm={1} md={1}>
    //            <Button
    //                outline
    //                color="info"
    //                type="button"
    //                id={`PopoverNormal-${file.requestId}`}
    //                className="no-border btn-icon">
    //                <ErrorOutlineOutlinedIcon/>
    //            </Button>
    //            <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${file.requestId}`}>
    //                <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
    //                <PopoverBody>
    //                    <CustomPopover label={label}/>
    //                </PopoverBody>
    //            </UncontrolledPopover>
    //        </Col>);
    //        if ( file.status === 'SIGN' ) {
    //            statusGlyph = (<Col sm={1} md={1}>
    //                <Button
    //                    outline
    //                    color="info"
    //                    type="button"
    //                    id={`PopoverSign-${file.requestId}`}
    //                    className="no-border btn-icon">
    //                    <CreateIcon className="green"/>
    //                </Button>
    //                <UncontrolledPopover trigger="focus" placement="left" target={`PopoverSign-${file.requestId}`}>
    //                    <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
    //                    <PopoverBody>
    //                        <CustomPopover label={label}/>
    //                    </PopoverBody>
    //                </UncontrolledPopover>
    //            </Col>);
    //        }  else if ( file.status === 'WAITING' ) {
    //            statusGlyph = (<Col sm={1} md={1}>
    //                <Button
    //                    outline
    //                    color="info"
    //                    type="button"
    //                    id={`PopoverStart-${file.requestId}`}
    //                    className="no-border btn-icon">
    //                    <CreateIcon className="red glyphicon-ring"/>
    //                </Button>
    //                <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${file.requestId}`}>
    //                    <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
    //                    <PopoverBody>
    //                        <CustomPopover label={label}/>
    //                    </PopoverBody>
    //                </UncontrolledPopover>
    //            </Col>);
    //        } else if ( file.status === 'START' ) {
    //            statusGlyph = (<Col sm={1} md={1}>
    //                <Button
    //                    outline
    //                    color="info"
    //                    type="button"
    //                    id={`PopoverStart-${file.requestId}`}
    //                    className="no-border btn-icon">
    //                    <CreateIcon className="red glyphicon-ring"/>
    //                </Button>
    //                <UncontrolledPopover trigger="focus" placement="left" target={`PopoverStart-${file.requestId}`}>
    //                    <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
    //                    <PopoverBody>
    //                        <CustomPopover label={label}/>
    //                    </PopoverBody>
    //                </UncontrolledPopover>
    //            </Col>);
    //        } else if ( file.status === 'NORMAL' ) {
    //            statusGlyph = (<Col sm={1} md={1}>
    //                <Button
    //                    outline
    //                    color="info"
    //                    type="button"
    //                    id={`PopoverNormal-${file.requestId}`}
    //                    size="sm"
    //                    className="no-border btn-icon">
    //                    <ErrorOutlineOutlinedIcon/>
    //                </Button>
    //                <UncontrolledPopover trigger="focus" placement="left" target={`PopoverNormal-${file.requestId}`}>
    //                    <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
    //                    <PopoverBody>
    //                        <CustomPopover label={label}/>
    //                    </PopoverBody>
    //                </UncontrolledPopover>
    //            </Col>);
    //        }
    //        return (
    //            <li className="list-group-item" key={file.requestId}>
    //                <Row>
    //                    {statusGlyph}
    //                    <Col sm={{ size: 8, offset: 1 }} md={{ size: 8, offset: 1 }}>
    //                        {file.value}
    //                        <FormText
    //                            color="muted">{file.recDate ? getDateDetails( file.recDate ) : ''
    //                        } / {file.recUser}</FormText>
    //                    </Col>
    //                    <Col sm={1} md={1}>
    //                        <Button
    //                            size="sm"
    //                            color="primary"
    //                            className="btn-icon"
    //                            disabled={file.status === 'WAITING'}
    //                            onClick={() => handleDownloadFile( channelContent.id, file )}>
    //                            <GetApp/>
    //                        </Button>
    //                    </Col>
    //                    {file.status === 'WAITING' ? (<FormText>
    //                        {label.casJuridiqueForm.waiting}
    //                    </FormText>): null}
    //                </Row>
    //            </li>
    //        );
    //    } ) : null;

    return (
        <Row>
            <Col lg={12} md={12} sm={12} xs={12}>
                <Form horizontal>
                    {/* PARTIE INFO*/}
                    {channel.parties ? map( channel.parties, partie => {
                        return partie.type !== 'creator' ? (
                            <Row>
                                <Label md="3">{partie.label} </Label>
                                <Col md="8">
                                    <FormGroup>
                                        <input className="form-control" disabled={true} value={partie.email}
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
                                        onClick={( e ) => _toggleCreateConseil( e, partie )}
                                    >
                                        <i className="tim-icons icon-pencil"/>
                                    </Button>
                                </Col>
                                {/* OPEN TO CREATE A CONSEIL  */}
                                {!isNil( openModalConseil ) ?
                                    (
                                        <ConseilModal
                                            isCreate={false}
                                            dossierType={dossierType}
                                            partie={openModalConseil}
                                            partiesCas={null}
                                            updatePartie={channelUpdated}
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
                        {/* ATTACH DOCUMENT / SIGN DOCUMENT */}
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
                    {/*list of files freezed*/}

                    <Row>
                        <Label for="exampleFiles" sm={2}>{label.casJuridiqueForm.label4} {' '}
                            <Button
                                type="button"
                                size="sm"
                                outline
                                id="PopoverFocus-channel"
                                className="marginLeft10 btn-icon">
                                <HelpIcon></HelpIcon>
                            </Button>
                        </Label>
                        <UncontrolledPopover trigger="focus" placement="left" target="PopoverFocus-channel">
                            <PopoverHeader>{label.casJuridiqueForm.status}</PopoverHeader>
                            <PopoverBody>
                                <CustomPopover label={label}/>
                            </PopoverBody>
                        </UncontrolledPopover>
                        <Col lg={9} md={9} sm={10}>
                            {
                                // if size of the comment is > than MAX_COMMENT show "more" link to expand with the last MAX_COMMENT comments displayed
                                // TBD
                                filesListOld ?
                                    (
                                        <div>
                                            <Button color="primary" onClick={_toggleFiles} className="btn-link"
                                                    style={{ marginBottom: '1rem' }}>{label.casJuridiqueForm.label114}</Button>
                                            <Collapse isOpen={collapseFiles}>

                                                {filesListOldComponents}

                                            </Collapse>

                                        </div>
                                    ) : null
                            }


                            {filesList ? map( filesList, file => {
                                let statusGlyph = (<Col sm={1} md={1}>
                                    <Button
                                        outline
                                        color="info"
                                        type="button"
                                        id={`PopoverNormal-${file.requestId}`}
                                        className="no-border btn-icon">
                                        <ErrorOutlineOutlinedIcon/>
                                    </Button>
                                    <UncontrolledPopover trigger="focus" placement="left"
                                                         target={`PopoverNormal-${file.requestId}`}>
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
                                        <UncontrolledPopover trigger="focus" placement="left"
                                                             target={`PopoverSign-${file.requestId}`}>
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
                                        <UncontrolledPopover trigger="focus" placement="left"
                                                             target={`PopoverStart-${file.requestId}`}>
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
                                        <UncontrolledPopover trigger="focus" placement="left"
                                                             target={`PopoverStart-${file.requestId}`}>
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
                                        <UncontrolledPopover trigger="focus" placement="left"
                                                             target={`PopoverNormal-${file.requestId}`}>
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
                                                    className="btn-icon"
                                                    disabled={file.status === 'WAITING'}
                                                    onClick={() => handleDownloadFile( channelContent.id, file )}>
                                                    <GetApp/>
                                                </Button>
                                            </Col>
                                            {file.status === 'WAITING' ? (<FormText>
                                                {label.casJuridiqueForm.waiting}
                                            </FormText>) : null}
                                        </Row>
                                    </li>
                                );
                            } ) : null}
                        </Col>
                    </Row>
                    <Row>
                        <Label for="comment" sm={2}>{label.casJuridiqueForm.label12}</Label>

                        <Col lg={10} md={10} sm={10}>
                            <Input
                                name="comment"
                                type ="textarea"
                                rows={4}
                                placeholder="Ajouter une réponse"
                                onChange={_updateCommentCas}
                            />
                        </Col>
                    </Row>
                    {/*list of comments freezed*/}

                    {
                        // if size of the comment is > than MAX_COMMENT show "more" link to expand with the last MAX_COMMENT comments displayed
                        // TBD
                        commentsListOld ?
                            (
                                <div>
                                    <Button color="primary" onClick={_toggleComments} className="btn-link"
                                            style={{ marginBottom: '1rem' }}>{label.casJuridiqueForm.label100}</Button>
                                    <Collapse isOpen={collapseComments}>

                                        {commentsListOldComponents}

                                    </Collapse>

                                </div>
                            ) : null
                    }
                    {
                        // if size of the comment is > than MAX_COMMENT show "more" link to expand with the last MAX_COMMENT comments displayed
                        // TBD
                        commentsList ? map( commentsList, comment => {
                            tooltipId++;

                            const formatDate = getDateDetails( comment.recDate );

                            return (
                                <Row key={comment.order}>
                                    <Label for="selectCategories"
                                           sm={2}>{comment.order}. {label.casJuridiqueForm.label15}</Label>
                                    <Col lg={10} md={10} sm={10} id={'TooltipLast-chan-' + tooltipId}>
                                        <FormGroup>

                                            <Input
                                                value={comment.message}
                                                type="textarea"
                                                className="form-control"
                                                rows={5}
                                                disabled
                                            />
                                            <FormText color="muted">
                                                {comment.userType} , {formatDate}
                                            </FormText>
                                            <UncontrolledTooltip
                                                placement="bottom" target={'TooltipLast-chan-' + tooltipId}>
                                                {comment.message}
                                            </UncontrolledTooltip>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            );
                        } ) : null
                    }
                    <Row>
                        <Col lg={{ offset: 8, size: 4 }} md={{ offset: 8, size: 4 }} sm={{ size: 5 }}>
                            <Button color="primary" type="button" disabled={isLoading || isLoadingSave}
                                    onClick={_updateChannel}
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

                </Form>

                {modalUploadBasicDocument ? (
                    <ModalUploadBasicDocument
                        affaireId={affaireId}
                        vckeySelected={vckeySelected}
                        cas={channelContent}
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
                        cas={channelContent}
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

