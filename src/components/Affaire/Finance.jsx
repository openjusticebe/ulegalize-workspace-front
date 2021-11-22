import React, { useEffect, useRef, useState } from 'react';

// reactstrap components
import { Table } from 'reactstrap';
import NotificationAlert from 'react-notification-alert';
import { getFinanceDossierById } from '../../services/DossierService';
import { useAuth0 } from '@auth0/auth0-react';
import FinanceDTO from '../../model/affaire/FinanceDTO';
import classnames from 'classnames';

// nodejs library that concatenates classes
const isNil = require( 'lodash/isNil' );

export default function Finance( props ) {
    const {
        label,
        affaireid,
        currency,
        vckeySelected,
        updateFinance
    } = props;
    const notificationAlert = useRef( null );
    const { getAccessTokenSilently } = useAuth0();

    const [data, setData] = useState( new FinanceDTO() );

    useEffect( () => {
        (async () => {
            const accessToken = await getAccessTokenSilently();

            const result = await getFinanceDossierById( accessToken, affaireid, vckeySelected );
            if ( (isNil( result.error ) || !result.error) && !isNil( result.data ) ) {
                setData( new FinanceDTO(result.data) );
            } else {
                setData( new FinanceDTO() );
            }

        })();
    }, [getAccessTokenSilently, updateFinance] );

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlert}/>
            </div>
            <Table responsive>
                <tbody>
                <tr>
                    <td className="text-left">{label.finance.label2}</td>
                    <td>{data.prestations} {currency}</td>
                </tr>
                <tr>
                    <td className="text-left">{label.finance.label3}</td>
                    <td>{data.fraisAdmin} {currency}</td>
                </tr>
                <tr>
                    <td className="text-left">{label.finance.label4}</td>
                    <td>{data.debours} {currency}</td>
                </tr>
                <tr>
                    <td className="text-left">{label.finance.label5}</td>
                    <td>{data.collaboration} {currency}</td>
                </tr>
                {/* TOTAL HONORAIRE HTVA */}
                <tr>
                    <td className="text-left">{label.finance.label8}</td>
                    <td><b>{data.totalHonoraire} {currency}</b></td>
                </tr>
                {/* TOTAL FACTURES EMISES HTVA */}
                <tr>
                    <td className="text-left">{label.finance.label9}</td>
                    <td><b>{data.totalInvoice} {currency}</b></td>
                </tr>
                <tr>
                    <td className="text-left">{label.finance.label6}</td>
                    <td><b className={classnames({'green': data.balance >= 0},
                        {'red': data.balance < 0})}>{data.balance} {currency}</b></td>
                </tr>
                </tbody>
            </Table>


        </>
    );
}