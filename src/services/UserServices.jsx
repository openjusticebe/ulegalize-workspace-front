import axios from 'axios';

/**
 * get user profileDTO
 * @param accessToken
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function getUsers(accessToken) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/login/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: {}, error: true};
        });
    } catch (e) {
        return {error: true};
    }

}

export async function getLightUsers(accessToken) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/login/light/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).catch(() => {
            return {data: {}, error: true};
        });
    } catch (e) {
        return {error: true};
    }

}

/**
 * Used after confirm signup
 * @param accessToken
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function registerUser(accessToken) {
    try {
        return await axios.post(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/login/user`, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    } catch (e) {
        return {error: true};
    }

}

/**
 * after finishing RENAME temporary vckey
 * @param accessToken
 * @param newVckey
 * @returns {Promise<{error: boolean}|AxiosResponse<any>>}
 */
export async function validateUser(accessToken, defaultLawfirmDTO) {
    try {
        return await axios.post(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/login/validate/user`,
            defaultLawfirmDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }).catch(() => {
            return {data: {}, error: true};
        });
    } catch (e) {
        return {error: true};
    }
}

export async function verifyUser(email, hashkey) {
    try {
        return await axios.get(`${process.env.REACT_APP_LAWFIRM_SERVER}v2/login/verifyUser`, {
            params: {
                email: email,
                key: hashkey
            }
        }).catch(() => {
            return {data: false};
        });
    } catch (e) {
        return {data: false};
    }
}
