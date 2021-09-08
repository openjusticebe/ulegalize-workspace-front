import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import {
     attachEsignDocumentChannel,
    attachFileChannel,
    downloadFileChannelAttached
} from '../../services/transparency/CaseService';
import ChannelDTO from '../../model/affaire/ChannelDTO';
import ContentChannel from './ContentChannel';
import ReactLoading from 'react-loading';
import { downloadWithName } from '../../utils/TableUtils';

const isNil = require( 'lodash/isNil' );

//const find = require( 'lodash/find' );

export default function Channels( {
                                      dossierType,
                                      channelProp,
                                      channelUpdated,
                                      affaireId,
                                      vckeySelected,
                                      showMessagePopup,
                                      history,
                                      enumRights,
                                      emailPayUser,
                                      isLoadingSave,
                                      label
                                  } ) {

    const { getAccessTokenSilently } = useAuth0();
    const [isLoading, setIsLoading] = useState( true );
    const [channel, setChannel] = useState( new ChannelDTO() );
    const updateChannelRef = useRef( false );

    // get channel
    useEffect( () => {
        (async () => {
            setChannel( channelProp );
            setIsLoading( false );
        })();
    }, [getAccessTokenSilently, channelProp] );


    const _downloadFile = async ( channelId, file ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        const result = await downloadFileChannelAttached( accessToken, channelId, file.value );
        //const name = fileContent.name;
        //const arrn = name.split( '/' );
        if ( result.error ) {
            showMessagePopup( label.affaire.error1, 'danger' );
        } else {
            downloadWithName( result.data, file.value );
        }
        setIsLoading( false );

    };
    const _attachFileCase = async ( file ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            showMessagePopup( label.affaire.error2, 'danger' );

            return;
        }
        const result = await attachFileChannel( accessToken, file );
        if ( result.error ) {
            showMessagePopup( label.affaire.error2, 'danger' );
        } else {
            showMessagePopup( label.affaire.success1, 'success' );
        }
        channelUpdated();
        updateChannelRef.current = !updateChannelRef.current;

        // only if its different than null
        setIsLoading( false );

    };

    const _attachEsignDocument = async ( file ) => {
        setIsLoading( true );
        const accessToken = await getAccessTokenSilently();

        if ( isNil( file ) ) {
            showMessagePopup( label.affaire.error2, 'danger' );
            return;
        }
        showMessagePopup( label.affaire.label9, 'warning' );

        const result = await attachEsignDocumentChannel( accessToken, affaireId, file );

        if ( !result.error ) {
            showMessagePopup( label.affaire.success1, 'success' );
        }

        channelUpdated();
        updateChannelRef.current = !updateChannelRef.current;

        setIsLoading( false );

    };

    return (

        <Card>
            <CardBody>
                {isLoading ? (
                    <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                ) : (
                    <>
                        <Row>
                            <Col md={12} xs={12}>
                                <ContentChannel
                                    channel={channel}
                                    dossierType={dossierType}
                                    vckeySelected={vckeySelected}
                                    affaireId={affaireId}
                                    label={label}
                                    history={history}
                                    enumRights={enumRights}
                                    channelUpdated={channelUpdated}
                                    emailPayUser={emailPayUser}
                                    showMessagePopup={showMessagePopup}
                                    isLoadingSave={isLoadingSave}
                                    downloadFile={_downloadFile}
                                    attachEsignDocumentChannel={_attachEsignDocument}
                                    attachFileCase={_attachFileCase}
                                />

                            </Col>
                        </Row>

                    </>
                )}

            </CardBody>
        </Card>

    );
}

