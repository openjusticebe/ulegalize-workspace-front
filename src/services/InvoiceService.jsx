import axios from 'axios';
import InvoiceSummary from '../model/invoice/InvoiceSummary';

export async function getInvoiceList( accessToken, offset, limit,vckeySelected, searchEcheance, searchDate, searchYearDossier, searchNumberDossier, searchClient ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/list`, {
            params: {
                offset: offset,
                limit: limit,
                searchEcheance: searchEcheance,
                searchDate: searchDate,
                searchYearDossier: searchYearDossier,
                searchNumberDossier: searchNumberDossier,
                searchClient: searchClient,
                vcKey: vckeySelected,
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getInvoiceById( accessToken, invoiceId, vckeySelected ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/${invoiceId}`, {
            params: {  vcKey: vckeySelected },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getDefaultInvoice( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/default`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function getInvoicesByDossierId( accessToken, vckeySelected, dossierId, offset, limit ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/list`, {
            params: { offset: offset,
                limit: limit,
                vcKey: vckeySelected,
                dossierId: dossierId
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } )
        .catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getInvoicesBySearchCriteria( accessToken, searchCriteria ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices`, {
            params: { searchCriteria: searchCriteria },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function createInvoice( accessToken, invoiceSummary ) {
    try {
        return axios.post(
            `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices`,
            new InvoiceSummary( invoiceSummary ),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function updateInvoice( accessToken, invoiceSummary ) {
    try {
        return axios.put(
            `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices`,
            invoiceSummary,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function deleteInvoiceById( accessToken, invoiceId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/${invoiceId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function countInvoiceDetailsByVat( accessToken, vat ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/vat/${vat}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: 1 };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function validateInvoice( accessToken, invoiceId ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/validate/${invoiceId}`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function generateInvoice( accessToken, invoiceId ) {
    try {
        return axios.get( `${process.env.REACT_APP_REPORT_SERVER}invoice/${invoiceId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error:true}
        });
    } catch ( e ) {
        return { error: true, data: {}};
    }
}
export async function generateInvoiceValid( accessToken, invoiceId ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/invoice/${invoiceId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error:true}
        });
    } catch ( e ) {
        return { error: true, data: {}};
    }
}
export async function getPrestationByDossierId( accessToken, invoiceId, dossierId ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/invoices/${invoiceId}/prestations/${dossierId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
        .catch(()=>{
            return {error:true}
        });
    } catch ( e ) {
        return { error: true, data: {}};
    }
}