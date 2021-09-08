import React, { useEffect, useRef, useState } from 'react';

// reactstrap components
import {
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    Nav,
    NavItem,
    NavLink,
    Row,
    Spinner,
    TabContent,
    Table,
    TabPane
} from 'reactstrap';
import NotificationAlert from 'react-notification-alert';
import LawfirmWebsiteDTO from '../../model/admin/generalInfo/LawfirmWebsiteDTO';
import LawfirmUserDTO from '../../model/admin/generalInfo/LawfirmUserDTO';
import {
    getLawfirmUsers,
    getPublicLawfirm,
    updateIsPublicLawfirmUsers,
    updatePublicLawfirm
} from '../../services/AdminService';
import { useAuth0 } from '@auth0/auth0-react';
import { getOptionNotification } from '../../utils/AlertUtils';

// nodejs library that concatenates classes
const map = require( 'lodash/map' );
const isNil = require( 'lodash/isNil' );
const isEmpty = require( 'lodash/isEmpty' );

export default function PublicSite( props ) {
    const {
        label,
    } = props;
    const notificationAlert = useRef( null );
    const activePublicLawyer = useRef( false );
    const [loadingSave, setLoadingSave] = useState( false );

    const [data, setData] = useState( new LawfirmWebsiteDTO() );
    const [userData, setUserData] = useState( [] );
    const [openModal, setOpenModal] = useState( false );
    const { getAccessTokenSilently } = useAuth0();

    const [horizontalTabs, setHorizontalTabs] = useState( 'site' );

    const _openPublicInfo = () => {
        setOpenModal( !openModal );
    };

    const _updatePublicSite = async () => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        // update lawfirm website (LawfirmWebsiteDTO)
        const result = await updatePublicLawfirm( accessToken, data );
        if ( !result.error ) {
            notificationAlert.current.notificationAlert( getOptionNotification( props.label.public.success100, 'info' ) );
        } else {
            notificationAlert.current.notificationAlert( getOptionNotification( 'une erreur est survenue lors de la mis à jour', 'danger' ) );
        }
        setLoadingSave( false );
    };

    const _activatePublicLawyer = async ( userId, isPublic ) => {
        setLoadingSave( true );
        const accessToken = await getAccessTokenSilently();

        // update active public
        const result = await updateIsPublicLawfirmUsers( accessToken, userId, isPublic );
        if ( !result.error ) {
            let message = isPublic === true ? props.label.public.label102 : props.label.public.label103;
            notificationAlert.current.notificationAlert( getOptionNotification( message, 'primary' ) );
        }
        activePublicLawyer.current = !activePublicLawyer.current;
        setLoadingSave( false );
    };

    // with this function we change the active tab for all the tabs in this page
    const changeActiveTab = ( e, tabState, tagName ) => {
        e.preventDefault();
        setHorizontalTabs( tagName );
    };

    // FIRST TO GET PUBLIC LAWFIRM
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let result = await getPublicLawfirm( accessToken );

            let lawfirmWebsiteDTO;

            if ( !isNil( result ) ) {
                if ( !isNil( result.data ) && !isEmpty( result.data ) ) {
                    lawfirmWebsiteDTO = new LawfirmWebsiteDTO( result.data );
                } else {
                    props.history.push( { pathname: `/auth/unauthorized/` } );
                }
            }
            setData( lawfirmWebsiteDTO );

        })();
    }, [getAccessTokenSilently] );

    // SECOND TO GET LIST OF LAWYERS
    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            let resultUser = await getLawfirmUsers( accessToken );

            let arrayUsers = map( resultUser.data, ( user ) => {
                return new LawfirmUserDTO( user );
            } );

            if ( arrayUsers.length > 0 ) {
                setUserData( arrayUsers );
            }

        })();
    }, [getAccessTokenSilently, activePublicLawyer.current] );

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            <Row>
                <Col md="12">
                    <Label>{label.public.label2}</Label>
                    <FormGroup>
                        <Input
                            value={data.title}
                            disabled={true}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>{label.public.label3}</Label>
                    <FormGroup>
                        <Input
                            value={data.intro}
                            disabled={true}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <Label>{label.public.label4}</Label>
                    <FormGroup>
                        <Input
                            value={data.philosophy}
                            disabled={true}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md={{ offset: 9, size: 2 }}>
                    <Button onClick={_openPublicInfo}><i className="tim-icons icon-pencil"/></Button>
                </Col>
            </Row>
            <Modal size="lg" isOpen={openModal} toggle={_openPublicInfo}>

                <ModalBody>
                    <Nav className="nav-pills-info" pills>
                        <NavItem>
                            <NavLink
                                data-toggle="tab"
                                href="#pablo"
                                className={
                                    horizontalTabs === 'site'
                                        ? 'active'
                                        : ''
                                }
                                onClick={e =>
                                    changeActiveTab( e, 'horizontalTabs', 'site' )
                                }
                            >
                                {props.label.public.label101}
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                data-toggle="tab"
                                href="#pablo"
                                className={
                                    horizontalTabs === 'users'
                                        ? 'active'
                                        : ''
                                }
                                onClick={e =>
                                    changeActiveTab( e, 'horizontalTabs', 'users' )
                                }
                            >
                                {props.label.public.label100}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent
                        activeTab={horizontalTabs}
                    >
                        <TabPane tabId="site">
                            <Row>
                                <Col md="12">
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                defaultChecked={data.active}
                                                type="checkbox"
                                                onChange={( e ) => {
                                                    setData( {
                                                        ...data,
                                                        active: e.target.checked
                                                    } );
                                                }}
                                            />{' '}
                                            <span className={`form-check-sign`}>
                                                                <span
                                                                    className="check"> {label.public.checkActivate}</span>
                                                            </span>
                                        </Label>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Label>{label.public.label2}</Label>
                                    <FormGroup>
                                        <Input
                                            value={data.title}
                                            onChange={( e ) => {
                                                setData( {
                                                    ...data,
                                                    title: e.target.value
                                                } );
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Label>{label.public.label3}</Label>
                                    <FormGroup>
                                        <Input
                                            value={data.intro}
                                            onChange={( e ) => {
                                                setData( {
                                                    ...data,
                                                    intro: e.target.value
                                                } );
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Label>{label.public.label4}</Label>
                                    <FormGroup>
                                        <Input
                                            value={data.philosophy}
                                            rows={5}
                                            onChange={( e ) => {
                                                setData( {
                                                    ...data,
                                                    philosophy: e.target.value
                                                } );
                                            }}

                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Label>{label.public.label5}</Label>
                                    <FormGroup>
                                        <Input
                                            value={data.about}
                                            rows={4}
                                            type="textarea"
                                            onChange={( e ) => {
                                                setData( {
                                                    ...data,
                                                    about: e.target.value
                                                } );
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <Label>{label.public.label6}</Label>
                                    <FormGroup>
                                        <Label>{label.public.label9}{' '}</Label>
                                        <Button
                                            color="primary"
                                            onClick={() => setOpenModal( !openModal )}
                                            className="btn-link">{label.public.label10}</Button>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                defaultChecked={data.acceptAppointments}
                                                type="checkbox"
                                                onChange={( e ) => {
                                                    setData( {
                                                        ...data,
                                                        acceptAppointments: e.target.checked
                                                    } );
                                                }}
                                            />{' '}
                                            <span className={`form-check-sign`}>
                                                                <span className="check"> {label.public.label8}</span>
                                                            </span>
                                        </Label>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="users">
                            <Row className="mt-3">
                                <Col md={12} lg={12}>
                                    <div
                                        style={{
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        <Table responsive>
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Alias</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {userData.map( ( item, index ) => (
                                                <>
                                                    <tr key={index}>
                                                        <td>{item.public ? (
                                                            <i className={`tim-icons icon-world green`}/>
                                                        ) : (
                                                            <i className={`tim-icons icon-world red`}/>
                                                        )}</td>
                                                        <td>{item.lawyerAlias}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.idRole}</td>
                                                        <td>
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input
                                                                        defaultChecked={item.public}
                                                                        type="checkbox"
                                                                        onChange={( e ) => _activatePublicLawyer( item.id, !item.public )}

                                                                    />{' '}
                                                                    <span className="form-check-sign">
                                                                            <span className="check"></span>
                                                                        </span>
                                                                </Label>
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                </>
                                            ) )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>
                        </TabPane>
                    </TabContent>
                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" onClick={_openPublicInfo}><i
                        className="fa fa-time"/>{label.public.label11}</Button>
                    {horizontalTabs === 'site' ? (
                        <Button color="primary" type="button" disabled={loadingSave}
                                id="invoiceLabelId1"
                                onClick={_updatePublicSite}
                        >
                            {loadingSave ? (
                                <Spinner
                                    size="sm"
                                    color="secondary"
                                />
                            ) : null}
                            {' '} {label.common.save}
                        </Button>
                    ) : null}
                </ModalFooter>
            </Modal>

        </>
    );
}