import axios from 'axios';
const forEach = require( 'lodash/forEach' );

export async function getClient(accessToken, search) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients`, {
            params: {
                searchCriteria: search
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: []}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function getClientByEmail(accessToken, email) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients/email/${email}`, {

            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {error: true}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function getClientsPagination(accessToken, offset, limit, searchCriteria) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients/list`, {
            params: {offset: offset, limit: limit,
                searchCriteria: searchCriteria},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: []}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function getClientById(accessToken, clientId) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients/${clientId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: []}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function getClientListByIds(accessToken, clientIds) {
    try {
        let params = new URLSearchParams();
        const types = forEach(clientIds, type=>{
            params.append("clientIds", type);
        }) ;
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients/ids`, {
            params: {
                clientIds: types+ ''
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: []}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function createClient(accessToken, client) {
    try {
        return axios.post(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients`,
            client,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            }).catch(() => {
            return {error: true}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function updateClient(accessToken, client) {
    try {
        return axios.put(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients`,
            client,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },

            });
    } catch (e) {
        return {error: true};
    }
}
export async function countClientsByName(accessToken, vckeySelected, searchCriteria) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients/clients/count`, {
            params: {
                vcKey: vckeySelected,
                searchCriteria: searchCriteria},
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: []}
        });
    } catch (e) {
        return {error: true};
    }
}
export async function deleteClientById(accessToken, clientId) {
    try {
        return await axios.delete(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/clients/${clientId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {error: true}
        });
    } catch (e) {
        return {error: true};
    }
}