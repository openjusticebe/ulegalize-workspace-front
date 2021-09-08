import React, { useState, useEffect, useRef } from 'react';
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    UncontrolledTooltip
} from 'reactstrap';
import CasJuridiqueForm from '../../affaire/CasJuridiqueForm';
import Channels from '../../affaire/Channels';
import ReactLoading from 'react-loading';
import { useAuth0 } from '@auth0/auth0-react';
import ChannelDTO from '../../../model/affaire/ChannelDTO';
import { getChannelsByCaseId } from '../../../services/transparency/CaseService';

const map = require( 'lodash/map' );
const size = require( 'lodash/size' );
const isEmpty = require( 'lodash/isEmpty' );
const isNil = require( 'lodash/isNil' );
const upperFirst = require( 'lodash/upperFirst' );
const MAX_HEIGHT_CARD = 700;

export default function ModalUpdateCase( {
                                             modalDetails, id, cas, email, label, enumRights,
                                             toggleModalDetails,
                                             downloadFile,
                                             showMessagePopup,
                                             attachFileCase,
                                             downloadChannelFile,
                                             attachFileChannel,
                                             vckeySelected, userId,
                                             history
                                         }) {
    const { getAccessTokenSilently } = useAuth0();
    const [isLoading, setIsLoading] = useState( false );
    const [channels, setChannels] = useState( [] );
    const [vTabs, setvTabs] = useState( 'vt1' );
    const updateChannelRef = useRef( false );

    const channelSize = channels ? size( channels ) : 0;

    const currentState = upperFirst( cas.groupment.currentWorkflowStep.label );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let result = await getChannelsByCaseId( accessToken, cas.id );
            if ( !result.error && !isEmpty(result.data) ) {
                const channelTemp = map(result.data, data =>{
                    return new ChannelDTO(data);
                })
                setChannels( channelTemp );

                setvTabs(channelTemp[0].id)

            }
        })();
    }, [getAccessTokenSilently, updateChannelRef.current] );
    const _updatedChannel = ()=>{
        setIsLoading( true );
        updateChannelRef.current = !updateChannelRef.current;
        setIsLoading( false );
    }
    return (
        <Modal size='xl' className="custom-large-modal-xl" isOpen={modalDetails} toggle={toggleModalDetails}>
            <ModalHeader className="justify-content-center" toggle={toggleModalDetails}>
                {label.casJuridiqueForm.label104} {id} <Badge bsStyle="primary">{currentState}</Badge>
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={channelSize === 0 ? 12 : 6}>
                        <Card style={{ minHeight: MAX_HEIGHT_CARD }}>
                            <CardHeader>
                                <Row>
                                    <Col md={{ size: 12 }} sm={12}>
                                        <CardTitle>{label.casJuridiqueForm.label114}</CardTitle>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <CasJuridiqueForm
                                    showSaveButton={true}
                                    enumRights={enumRights}
                                    emailPayUser={email}
                                    updateCaseRef={isLoading}
                                    clientId={null}
                                    affaireId={cas.affaireItem ? cas.affaireItem.value : null}
                                    cas={cas}
                                    dossierType={null}
                                    label={label}
                                    partie={null}
                                    lg={12} md={12}
                                    showMessagePopup={showMessagePopup}
                                    isLoadingSave={isLoading}
                                    downloadFile={downloadFile}
                                    attachFileCase={attachFileCase}
                                    vckeySelected={vckeySelected}
                                    userId={userId}
                                />
                            </CardBody>
                        </Card>

                    </Col>
                    {channelSize !== 0 ?
                        <Col md={6}>
                            <Card style={{ minHeight: MAX_HEIGHT_CARD }}>
                                <CardHeader>
                                    <Row>
                                        <Col md={{ size: 12 }} sm={12}>
                                            <CardTitle>{label.casJuridiqueForm.label115}</CardTitle>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    {/* SELECT CONSEIL */}
                                    <Col md={12} sm={12}>
                                        <Nav className="nav-pills-info" pills>
                                            {channels ? map( channels, channel => {
                                                const partieLabel = map( channel.parties, part => {
                                                    return part.label;
                                                } ).filter( element => !isNil( element ) ).join();

                                                const uniqueIdTooltip = `topTooltip-${channel.id}-`;

                                                return (
                                                    <NavItem id={uniqueIdTooltip}>
                                                        <NavLink
                                                            href="#"
                                                            className={vTabs === channel.id ? 'active' : ''}
                                                            onClick={() => setvTabs( channel.id )}
                                                        >
                                                            {size( partieLabel ) > 12 ? partieLabel.substring( 0, 12 ) + '...' : partieLabel}
                                                            <UncontrolledTooltip defaultOpen={false} placement="top"
                                                                                 target={uniqueIdTooltip} delay={0}>
                                                                {partieLabel}
                                                            </UncontrolledTooltip>
                                                        </NavLink>
                                                    </NavItem>
                                                );
                                            } ) : null}

                                        </Nav>
                                    </Col>

                                    <TabContent
                                        className="tab-space"
                                        activeTab={vTabs}
                                    >
                                        {channelSize !== 0 ? map( channels, channel => {

                                            return (
                                                <TabPane tabId={channel.id}>
                                                    {vTabs === channel.id ? (
                                                            <Channels
                                                                dossierType={null}
                                                                partieEmail={null}
                                                                showCreator={true}
                                                                vckeySelected={vckeySelected}
                                                                history={history}
                                                                enumRights={enumRights}
                                                                emailPayUser={email}
                                                                affaireId={cas.affaireItem ? cas.affaireItem.value : null}
                                                                showMessagePopup={showMessagePopup}
                                                                isLoadingSave={isLoading}
                                                                label={label}
                                                                downloadFile={downloadChannelFile}
                                                                attachFileCase={attachFileChannel}
                                                                channelUpdated={_updatedChannel}
                                                                channelProp={channel}/>
                                                        ) :
                                                        <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                                    }
                                                </TabPane>
                                            );
                                        } ) : null}
                                    </TabContent>
                                </CardBody>
                            </Card>

                        </Col>
                     : null}
                </Row>

                <hr className="my-2"/>


            </ModalBody>
            <ModalFooter>
                <Row>
                    <Col lg={{ size: 3 }} md={{ size: 3 }} sm={{ size: 5 }}>
                        <Button color="primary" type="button"
                                onClick={() => toggleModalDetails()}
                        >
                            {' '} {label.common.close}
                        </Button>
                    </Col>
                </Row>
            </ModalFooter>
        </Modal>
    );
}

