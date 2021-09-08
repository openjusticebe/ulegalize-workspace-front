import React, { useEffect, useRef, useState } from 'react';
// reactstrap components
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import { useAuth0 } from '@auth0/auth0-react';
import NotificationAlert from 'react-notification-alert';
import LawyerDTO from '../model/admin/user/LawyerDTO';
import { getOptionNotification } from '../utils/AlertUtils';
import { getLawyer, updateProfile, uploadProfileImage } from '../services/ProfileService';
import ImageUpload from '../components/CustomUpload/ImageUpload';

const isNil = require( 'lodash/isNil' );

export default function Profile( { label, history } ) {
    const [profile, setProfile] = useState( new LawyerDTO() );
    const profileOriginal = useRef();
    const [isUpdateProfile, setIsUpdateProfile] = useState( false );
    const [isUpdatePublic, setIsUpdatePublic] = useState( false );
    const { getAccessTokenSilently } = useAuth0();
    const notificationAlert = useRef( null );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();
            const result = await getLawyer( accessToken );

            if ( !isNil( result ) ) {
                if ( !isNil( result.data ) ) {
                    const profileDto = new LawyerDTO( result.data );
                    profileOriginal.current = profileDto;

                    setProfile( profileDto );
                } else if ( result.error ) {
                    // error message
                }
            } else {
                history.push( '/' );
            }

        })();
    }, [getAccessTokenSilently] );

    const _updateProfile = async () => {

        const accessToken = await getAccessTokenSilently();

        setIsUpdateProfile(!isUpdateProfile );
        let result = await updateProfile( accessToken, profile );

        if ( !result.error ) {
            profileOriginal.current = profile;
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        }

    };
    const _uploadPicture = async (file) => {
        const accessToken = await getAccessTokenSilently();

        let formData = new FormData();
        formData.append('files', file);

        let result = await uploadProfileImage( accessToken, formData );

        if ( !result.error ) {
            profileOriginal.current = profile;
            notificationAlert.current.notificationAlert( getOptionNotification( label.profile.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error1, 'danger' ) );
        }
    }
    const _updateProfilePublic = async () => {

        const accessToken = await getAccessTokenSilently();
        if ( !(/^[a-zà-ú0-9-+.]+$/).test( profile.alias ) ) {
            notificationAlert.current.notificationAlert( getOptionNotification( label.profile.error1, 'danger' ) );
            return;
        }
        setIsUpdatePublic( !isUpdatePublic );
        let result = await updateProfile( accessToken, profile );

        if ( !result.error ) {
            profileOriginal.current = profile;
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.success1, 'primary' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( label.common.error2, 'danger' ) );
        }

    };

    return (
        <>
            <div className="content">

                <div className="rna-container">
                    <NotificationAlert ref={notificationAlert}/>
                </div>
                <Row>
                    <Col md="6" sm={12}>
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">{label.profile.label1}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <ImageUpload
                                        saveFile={_uploadPicture}
                                        avatar={profile.picture}/>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={6} md={3}>{label.profile.user}</Label>
                                    <Col md="5" sm={6}>
                                        <Input
                                            disabled={true}
                                            placeholder={label.profile.user} type="email"
                                            value={profile.email}
                                            onChange={e => setProfile( { ...profile, email: e.target.value } )}
                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={6} md={3}>{label.profile.fullname}</Label>
                                    <Col md="5" sm={6}>
                                        <Input disabled={!isUpdateProfile}
                                               placeholder={label.profile.fullname} type="text"
                                               value={profile.fullName}
                                               onChange={e => setProfile( { ...profile, fullName: e.target.value } )}
                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={6} md={3}>{label.profile.initiale}</Label>
                                    <Col md="5" sm={6}>
                                        <Input disabled={!isUpdateProfile}
                                               placeholder={label.profile.initiale} type="text"
                                               value={profile.initials}
                                               onChange={e => setProfile( { ...profile, initials: e.target.value } )}
                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={6} md={3}>{label.profile.colorref}</Label>
                                    <Col md="5" sm={6}>
                                        {isUpdateProfile ?
                                            (
                                                <>
                                                    <Input type="color"
                                                           value={profile.color}
                                                           onChange={e => {
                                                               setProfile( { ...profile, color: e.target.value } );
                                                           }}
                                                    />
                                                </>
                                            ) : (
                                                <Badge className="badge-md "
                                                       style={{ backgroundColor: profile.color, display: 'initial' }}
                                                ></Badge>
                                            )}

                                    </Col>
                                </FormGroup>

                                <Row>
                                    <Col md="12">
                                        <FormGroup check>
                                            <Label check>
                                                <Input
                                                    disabled={!isUpdateProfile}
                                                    checked={profile.notification}
                                                    type="checkbox"
                                                    onChange={e => {
                                                        setProfile( { ...profile, notification: e.target.checked } );
                                                    }}
                                                />
                                                <span className={`form-check-sign`}>
                                                                <span className="check"> {label.profile.notification}</span>
                                                </span>
                                            </Label>
                                        </FormGroup>
                                    </Col>
                                </Row>

                            </CardBody>
                            <CardFooter>
                                {isUpdateProfile ?
                                    (
                                        <>
                                            <Button color="primary" type="button" className="float-right"
                                                    onClick={_updateProfile}>
                                                {label.common.save}
                                            </Button> {' '}
                                            <Button color="primary" type="button" className="float-right"
                                                    onClick={() => {
                                                        setProfile(profileOriginal.current);
                                                        setIsUpdateProfile( !isUpdateProfile );
                                                    }}>
                                                {label.common.cancel}
                                            </Button>

                                        </>
                                    ) : (
                                        <Button color="primary" type="button" className="float-right"
                                                onClick={() => {setIsUpdateProfile( !isUpdateProfile );}}>
                                            {label.common.update}
                                        </Button>
                                    )}
                            </CardFooter>
                        </Card>
                    </Col>
                    <Col md="6" sm={12}>
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">{label.profile.label2}</CardTitle>
                                <small>
                                    {label.profile.label3}
                                </small>
                            </CardHeader>
                            <CardBody>
                                <FormGroup row>
                                    <Label sm={6} md={3}>{label.profile.aliasPublic}</Label>
                                    <Col md="5" sm={6}>
                                        <Input disabled={!isUpdatePublic}
                                               pattern="[a-zà-ú0-9-+]+"
                                               placeholder={label.profile.alias} type="text"
                                               value={profile.alias}
                                               onChange={e => setProfile( { ...profile, alias: e.target.value } )}
                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={4} md={3}>{label.profile.biography}</Label>
                                    <Col md={9} sm={8}>
                                        <Input disabled={!isUpdatePublic}
                                               placeholder={label.profile.biography}
                                               rows={9}
                                               type="textarea"
                                               value={profile.biography}
                                               onChange={e => setProfile( { ...profile, biography: e.target.value } )}
                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={4} md={3}>{label.profile.specialities}</Label>
                                    <Col md={9} sm={8}>
                                        <Input placeholder={label.profile.specialities}
                                               rows={5}
                                               type="textarea"
                                               disabled={!isUpdatePublic}
                                               value={profile.specialities}
                                               onChange={e => setProfile( { ...profile, specialities: e.target.value } )}
                                        />
                                    </Col>
                                </FormGroup>

                            </CardBody>
                            <CardFooter>
                                {isUpdatePublic ?
                                    (
                                        <>
                                            <Button color="primary" type="button" className="float-right"
                                                    onClick={_updateProfilePublic}>
                                                {label.common.save}
                                            </Button> {' '}
                                            <Button color="primary" type="button" className="float-right"
                                                    onClick={() => {
                                                        setProfile(profileOriginal.current);
                                                        setIsUpdatePublic( !isUpdatePublic );
                                                    }}>
                                                {label.common.cancel}
                                            </Button>

                                        </>
                                    ) : (
                                        <Button color="primary" type="button" className="float-right"
                                                onClick={() => {setIsUpdatePublic( !isUpdatePublic );}}>
                                            {label.common.update}
                                        </Button>
                                    )}
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}