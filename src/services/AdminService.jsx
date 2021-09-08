import axios from 'axios';
import SecurityGroupUserDTO from '../model/admin/user/SecurityGroupUserDTO';

export async function getAdminGeneralInfo( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/lawfirm`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: {} };
        } );
    } catch ( e ) {
        return { error: true, data: {} };
    }
}

export async function getPublicLawfirm( accessToken, vcKey ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/website`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function updatePublicLawfirm( accessToken, lawfirmWebsiteDTO ) {
    try {
        return await axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/website`,
            lawfirmWebsiteDTO,
            {
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

export async function getLawfirmUsers( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/users`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function updateIsPublicLawfirmUsers( accessToken, userId, isPublic ) {
    try {
        return await axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/user/${userId}/public`,
            '' + isPublic,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { error: true };
        } );

    } catch ( e ) {
        return { error: true };
    }
}

export async function updateIsActiveLawfirmUsers( accessToken, userId, isActive ) {
    try {
        return await axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/lawfirm/user/${userId}/active`,
            '' + isActive,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { error: true };
        } );

    } catch ( e ) {
        return { error: true };
    }
}

export async function getAdminPrestationList( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/prestation/type`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function deleteAdminPrestationType( accessToken, prestationTypeId ) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/prestation/type/${prestationTypeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: 'ok' };
        } );
    } catch ( e ) {
        return { error: true, data: 'nok' };
    }
}

export async function updateAdminPrestationType( accessToken, prestationTypeId, prestationTypeDto ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/prestation/type/${prestationTypeId}`,
            prestationTypeDto,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: prestationTypeDto };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function createAdminPrestationType( accessToken, prestationTypeDto ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/prestation/type`,
            prestationTypeDto,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: prestationTypeDto };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getAdminFraisList( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/frais/type`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function deleteAdminFraisType( accessToken, deboursTypeId ) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/frais/type/${deboursTypeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: 'ok' };
        } );
    } catch ( e ) {
        return { error: true, data: 'nok' };
    }
}

export async function updateAdminFraisType( accessToken, deboursTypeId, fraisAdminDTO ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/frais/type/${deboursTypeId}`,
            fraisAdminDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: fraisAdminDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function createAdminFraisType( accessToken, fraisAdminDTO ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/frais/type`,
            fraisAdminDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: fraisAdminDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getAdminAccountingList( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/accounting/type`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function deleteAdminAccountingType( accessToken, accountingTypeId ) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/accounting/type/${accountingTypeId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: 'ok' };
        } );
    } catch ( e ) {
        return { error: true, data: 'nok' };
    }
}

export async function updateAdminAccountingType( accessToken, accountingTypeId, accountingTypeDTO ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/accounting/type/${accountingTypeId}`,
            accountingTypeDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: accountingTypeDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function createAdminAccountingType( accessToken, accountingTypeDTO ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/accounting/type`,
            accountingTypeDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: accountingTypeDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getAdminBankAccountList( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/bankaccount/type`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: [] };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function deleteAdminBankAccountType( accessToken, compteId ) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/bankaccount/type/${compteId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { data: 'ok' };
        } );
    } catch ( e ) {
        return { error: true, data: 'nok' };
    }
}

export async function updateAdminBankAccountType( accessToken, compteId, bankAccountDTO ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/bankaccount/type/${compteId}`,
            bankAccountDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: bankAccountDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function createAdminBankAccountType( accessToken, bankAccountDTO ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/bankaccount/type`,
            bankAccountDTO,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: false, data: bankAccountDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function getFullUserResponsableList( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/users/full`, {
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

export async function getSecurityGroup( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityGroup`, {
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

export async function existSecurityGroup( accessToken, newName ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityGroup/exists`, {
            params: {
                securityGroupName: newName
            },
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

export async function deleteSecurityUserGroup( accessToken, userId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityUserGroup/${userId}`, {
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

export async function deleteSecurityGroup( accessToken, securityGroupId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityGroup/${securityGroupId}`, {
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

export async function saveUserToVcKey( accessToken, lawyerDTO ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityUserGroup`,
            new SecurityGroupUserDTO( lawyerDTO ),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: true, data: lawyerDTO };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function saveSecurityGroupToVcKey( accessToken, newName ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityGroup`,
            newName,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { error: true, data: newName };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

/* MANAGE SECURITY MEMBERS POPUP*/
export async function getSecurityUserGroupBySecurityGroupId( accessToken, securityGroupId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityUserGroup/${securityGroupId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true, data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function getOutSecurityUserGroupBySecurityGroupId( accessToken, securityGroupId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityUserGroup/out/${securityGroupId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true, data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function addUserToSecurityGroup( accessToken, securityGroupId, userId ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/${securityGroupId}/user`,
            userId,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function deleteUserToSecurityGroup( accessToken, securityGroupId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/${securityGroupId}/user`, {
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

/* MANAGE SECURITY MEMBERS POPUP*/

/* MANAGE SECURITY RIGHT POPUP*/
export async function getSecurityRightGroupBySecurityGroupId( accessToken, securityGroupId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityRightGroup/${securityGroupId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true, data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function getOutSecurityRightGroupBySecurityGroupId( accessToken, securityGroupId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/securityRightGroup/out/${securityGroupId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true, data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function addRightToSecurityGroup( accessToken, securityGroupId, rightId ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/${securityGroupId}/right`,
            rightId,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function deleteRightToSecurityGroup( accessToken, securityGroupRightId ) {
    try {
        return await axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/security/${securityGroupRightId}/right`, {
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

/* MANAGE SECURITY RIGHT POPUP*/

/* VAT */

export async function deleteAdminVat( accessToken, vatId ) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/vat/${vatId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: 'nok' };
    }
}

export async function createAdminVat( accessToken, newVat ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/vat`,
            newVat,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            } ).catch( () => {
            return { error: true, data: newVat };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function changeAdminDefaultVat( accessToken, itemValue ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/vat/${itemValue}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            } ).catch( () => {
            return { error: true };
        } );
    } catch ( e ) {
        return { error: true, data: [] };
    }
}

export async function existVirtualCabVatByVat( accessToken, vat ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/vat/exist/${vat}`, {
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

export async function countVirtualCabVatByVcKey( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/vat/nb`, {
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

/* VAT */

/* MODELS */

export async function getAdminModelsList( accessToken ) {
    try {
        return axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/models`, {
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

export async function updateModels( accessToken, models ) {
    try {
        return axios.put( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/models`,
            models,
            {
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

export async function createModels( accessToken, models ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/models`,
            models,
            {
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

export async function deleteAdminModel( accessToken, modelsId ) {
    try {
        return axios.delete( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/models/${modelsId}`,
            {
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

export async function getTemplatDataByDossierId( accessToken, affaireId ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/templateData/${affaireId}`, {
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

export async function getTemplatData( accessToken ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/admin/templateData`, {
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

export async function downloadTemplate( accessToken, filename ) {
    try {
        return await axios.get( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/template/file`, {
            params: { filename: filename },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        } ).catch( () => {
            return { error: true, data: [] };
        } );
    } catch ( e ) {
        return { error: true };
    }
}

export async function uploadModel( accessToken, data ) {
    try {
        return axios.post( `${process.env.REACT_APP_LAWFIRM_SERVER}v2/drive/template`,
            data,
            {
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

/* MODELS */