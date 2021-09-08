import React, { useState } from 'react';

// reactstrap components
import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from 'reactstrap';
import Benefits from "./administration/Benefits";
import Items from "./administration/Items";
import AdministrativeExpenses from "./administration/AdministrativeExpenses";
import GeneralInfo from "./administration/general/GeneralInfo";
import BankAccounts from './administration/BankAccounts'
import PublicSite from '../components/Admin/PublicSite';
import Users from './administration/security/Users';
import SecurityGroup from './administration/security/SecurityGroup';
import Vats from './administration/Vats';
import Models from './administration/Models';
import ReactLoading from 'react-loading';


export default function Administration(props) {
    const {
        label,
        currency,
        refreshUserProfile
    } = props;

    const [horizontalDetailsTabs, setHorizontalDetailsTabs] = useState( 'vat' );
    const [verticalTabsIcons, setVerticalTabsIcons] = useState( 'users' );

   // with this function we change the active tab for all the tabs in this page
    const changeActiveDetailsTab = ( e, tabState, tadName ) => {
        e.preventDefault();
        setHorizontalDetailsTabs(tadName)
    };
   // with this function we change the active tab for all the tabs in this page
    const changeUsersTab = ( e, tadName ) => {
        e.preventDefault();
        setVerticalTabsIcons(tadName)
    };

    return (
        <>
            <div className="content">
                <Row>
                    <Col md="8">
                       <GeneralInfo
                           refreshUserProfile={refreshUserProfile}
                           currency={currency}
                           label={label}/>

                    </Col>
                    <Col className="ml-auto mr-auto" md="4" sm={12}>
                        <Card className="card-chart">
                            <CardHeader>
                                <CardTitle tag="h4">{label.public.title}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <PublicSite {...props}/>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Card style={{maxHeight:600}}>
                            <CardHeader>
                                <CardTitle tag="h4">{label.administration.label8}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col lg="3" md={3}>
                                        {/* color-classes: "nav-pills-primary", "nav-pills-info", "nav-pills-success", "nav-pills-warning","nav-pills-danger" */}
                                        <Nav
                                            className="nav-pills-info nav-pills-icons flex-column"
                                            pills
                                        >
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        verticalTabsIcons === 'users'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={
                                                        e => changeUsersTab( e,  "users" )
                                                    }
                                                >
                                                    <i className="tim-icons icon-badge"/>
                                                    {label.administration.label4}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    data-toggle="tab"
                                                    href="#pablo"
                                                    className={
                                                        verticalTabsIcons === 'secGroup'
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={e =>
                                                        changeUsersTab( e,  "secGroup" )

                                                    }
                                                >
                                                    <i className="tim-icons icon-lock-circle"/>
                                                    {label.administration.label5}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                    </Col>
                                    <Col lg={9} md={9}>
                                        <TabContent activeTab={verticalTabsIcons}>
                                            <TabPane tabId="users">
                                                <Users parentProps={props} />
                                            </TabPane>
                                            <TabPane tabId="secGroup">
                                                <SecurityGroup parentProps={props} />
                                            </TabPane>
                                        </TabContent>
                                    </Col>
                                </Row>

                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                            </CardHeader>
                            <CardBody>
                                <Nav className="nav-pills-info" pills>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            className={
                                                horizontalDetailsTabs === "vat" ? "active" : ""
                                            }
                                            onClick={(e) =>
                                                changeActiveDetailsTab( e, "horizontalDetailsTabs", "vat" )
                                            }
                                        >
                                            {label.administration.label6}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalDetailsTabs === "benefits" ? "active" : ""
                                            }
                                            onClick={(e) =>
                                                changeActiveDetailsTab( e, "horizontalDetailsTabs", "benefits" )
                                            }
                                        >
                                            {label.administration.label0}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalDetailsTabs === "administrativeexpenses" ? "active" : ""
                                            }
                                            onClick={(e) =>
                                                changeActiveDetailsTab( e, "horizontalDetailsTabs", "administrativeexpenses" )
                                            }
                                        >
                                            {label.administration.label1}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalDetailsTabs === "accounting" ? "active" : ""
                                            }
                                            onClick={(e) =>
                                                changeActiveDetailsTab( e, "horizontalDetailsTabs", "accounting" )
                                            }
                                        >
                                            {label.administration.label2}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalDetailsTabs === "bankaccounts" ? "active" : ""
                                            }
                                            onClick={(e) =>
                                                changeActiveDetailsTab( e, "horizontalDetailsTabs", "bankaccounts" )
                                            }
                                        >
                                            {label.administration.label3}
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            data-toggle="tab"
                                            href="#pablo"
                                            className={
                                                horizontalDetailsTabs === "models" ? "active" : ""
                                            }
                                            onClick={(e) =>
                                                changeActiveDetailsTab( e, "horizontalDetailsTabs", "models" )
                                            }
                                        >
                                            {label.administration.label7}
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent
                                    className="tab-space"
                                    activeTab={horizontalDetailsTabs}
                                >
                                     <TabPane tabId="vat">
                                        <Vats parentProps={props} />
                                    </TabPane>
                                     <TabPane tabId="benefits">
                                         {horizontalDetailsTabs === 'benefits' ? (
                                                 <Benefits parentProps={props} />
                                             ) :
                                             <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                         }
                                    </TabPane>
                                    <TabPane tabId="administrativeexpenses">
                                        {horizontalDetailsTabs === 'administrativeexpenses' ? (
                                                <AdministrativeExpenses parentProps={props} />
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                    <TabPane tabId="accounting">
                                        {horizontalDetailsTabs === 'accounting' ? (
                                                <Items parentProps={props} />
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                    <TabPane tabId="bankaccounts">
                                        {horizontalDetailsTabs === 'bankaccounts' ? (
                                                <BankAccounts parentProps={props} />
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                    <TabPane tabId="models">
                                        {horizontalDetailsTabs === 'models' ? (
                                                <Models parentProps={props} />
                                            ) :
                                            <ReactLoading className="loading" height={'20%'} width={'20%'}/>
                                        }
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}