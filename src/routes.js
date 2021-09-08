import Dashboard from 'views/Dashboard.jsx';
import In from 'views/In.jsx';
import Administration from './views/Administration';
import Dossier from './views/affaire/Dossier';
import ContactsList from './views/list/ContactsList';
import InvoicesList from './views/list/InvoicesList';
import DossiersList from './views/list/DossiersList';
import Invoice from './views/Invoice';
import ComptaList from './views/list/ComptaList';
import Compta from './views/Compta';
import RegisterDossier from './views/affaire/saveupdate/RegisterDossier';
import Logout from './views/Logout';
import NewSignup from './views/NewSignup';
import CancelPayment from './views/CancelPayment';
import NotAuthorized from './views/NotAuthorized';
import Profile from './views/Profile';
import Drive from './views/Drive';
import CorrespondenceList from './views/list/CorrespondenceList';
import Payment from './views/Payment';
import EmailsList from './views/list/EmailsList';
import MailList from './views/affaire/mail/MailList';
import Mail from './views/affaire/mail/Mail';
import MailRouteList from './views/affaire/mail/MailRouteList';

function routes (label) {
    return [
        {
            path: '/logout',
            name: 'Logout',
            rtlName: 'لوحة القيادة',
            mini: 'DB',
            icon: 'tim-icons icon-chart-pie-36',
            component: Logout,
            invisible: true,
            layout: '/admin'
        },
        {
            path: '/newsignup',
            name: 'newUser',
            rtlName: 'لوحة القيادة',
            mini: 'DB',
            icon: 'tim-icons icon-chart-pie-36',
            component: NewSignup,
            invisible: true,
            layout: '/auth'
        },
        {
            path: '/dashboard',
            name: label.routes.label1,
            rtlName: 'لوحة القيادة',
            mini: 'DB',
            icon: 'tim-icons icon-chart-pie-36',
            component: Dashboard,
            layout: '/admin',
            checkTokenDrive: true
        },
        {
            path: '/profile',
            name: 'Profile',
            rtlName: 'لوحة القيادة',
            mini: 'DB',
            icon: 'tim-icons icon-chart-pie-36',
            component: Profile,
            layout: '/admin',
            invisible: true
        },
        {
            collapse: true,
            name: label.routes.label2,
            rtlName: 'لوحة القيادة',
            mini: 'DB',
            icon: 'tim-icons icon-bullet-list-67',
            views: [
                {
                    path: '/list/contacts',
                    name: label.routes.label3,
                    rtlName: 'لوحة القيادة',
                    mini: 'Cl',
                    right: [0, 1],
                    component: ContactsList,
                    layout: '/admin'
                },
                {
                    path: '/list/invoices',
                    name: label.routes.label4,
                    rtlName: 'لوحة القيادة',
                    mini: 'inv',
                    right: [0, 26],
                    component: InvoicesList,
                    layout: '/admin',
                    checkTokenDrive: true
                },
                {
                    path: '/list/affaires',
                    name: label.routes.label5,
                    rtlName: 'لوحة القيادة',
                    mini: 'aff',
                    right: [0, 2],
                    component: DossiersList,
                    layout: '/admin'
                },
                {
                    path: '/list/emails',
                    name: label.routes.label11,
                    rtlName: 'لوحة القيادة',
                    mini: 'emails',
                    right: [0, 2],
                    component: EmailsList,
                    layout: '/admin'
                },
                {
                    path: '/list/mails',
                    name: label.routes.label12,
                    rtlName: 'لوحة القيادة',
                    mini: 'mails',
                    right: [0, 2],
                    component: MailRouteList,
                    layout: '/admin'
                },
                {
                    path: '/list/compta',
                    name: label.routes.label6,
                    rtlName: 'لوحة القيادة',
                    mini: 'compt',
                    right: [0, 3],
                    component: ComptaList,
                    layout: '/admin'
                },
                {
                    path: '/list/cases',
                    name: label.routes.label7,
                    rtlName: 'لوحة القيادة',
                    mini: 'cor',
                    right: [0, 37],
                    component: CorrespondenceList,
                    layout: '/admin'
                }
            ]
        },
        {
            path: '/inbox',
            name: label.routes.label8,
            mini: 'In',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-email-85',
            right: [0, 33],
            component: In,
            layout: '/admin'
        },
        {
            path: '/drive',
            name: label.routes.label10,
            mini: 'Dr',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-app',
            right: [0, 30, 31, 32],
            component: Drive,
            layout: '/admin',
            checkTokenDrive: true
        },
        {
            path: '/security',
            name: label.routes.label9,
            mini: 'Sec',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-lock-circle',
            right: [0],
            component: Administration,
            layout: '/admin',
            checkTokenDrive: true
        },
        {
            path: '/payment',
            name: label.administration.label9,
            mini: 'Pay',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-money-coins',
            right: [0],
            component: Payment,
            layout: '/admin'
        },
        {
            path: '/affaire/:affaireid',
            name: 'Affaire',
            mini: 'Affaire',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            right: [0, 2, 20, 21],
            component: Dossier,
            layout: '/admin',
            invisible: true
        },
        {
            path: '/create/affaire',
            name: 'RegisterDossier',
            mini: 'RegisterDossier',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            right: [0, 21],
            component: RegisterDossier,
            layout: '/admin',
            invisible: true,
            checkTokenDrive: true
        },
        {
            path: '/update/affaire/:affaireid',
            name: 'UpdateAffaires',
            mini: 'UpdateAffaires',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            right: [0, 21],
            component: RegisterDossier,
            layout: '/admin',
            invisible: true
        },
        {
            path: '/compta/:comptaid',
            name: 'Compta',
            mini: 'compta',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-money-coins',
            right: [0, 3],
            component: Compta,
            layout: '/admin',
            invisible: true
        },
        {
            path: '/create/compta',
            name: 'Compta',
            mini: 'Compta',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-money-coins',
            right: [0, 15],
            component: Compta,
            layout: '/admin',
            invisible: true
        },
        {
            path: '/invoice/:invoiceid',
            name: 'Invoice',
            mini: 'Invoice',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            right: [0, 26, 28],
            component: Invoice,
            layout: '/admin',
            invisible: true,
            checkTokenDrive: true
        },
        {
            path: '/create/invoice',
            name: 'Invoice',
            mini: 'Invoice',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            right: [0, 27],
            component: Invoice,
            layout: '/admin',
            invisible: true,
            checkTokenDrive: true
        },
        {
            path: '/cancel/payment/:affaireid',
            name: 'Invoice',
            mini: 'Invoice',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            component: CancelPayment,
            layout: '/admin',
            invisible: true
        },
        {
            path: '/unauthorized',
            name: 'Invoice',
            mini: 'Invoice',
            rtlName: 'لوحة القيادة',
            icon: 'tim-icons icon-settings-gear-63',
            component: NotAuthorized,
            layout: '/auth',
            invisible: true
        }
    ];
}

export default routes;
