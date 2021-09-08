
export default class  ProfileDTO {
	id;
	fullName;
	email;
	phone;
	vcKeySelected;
	temporaryVc;
	language;
	symbolCurrency;
	userId;
	enumRights;
	driveType;

	constructor(profile) {
		if(profile) {
			this.id = profile.id;
			this.fullName = profile.fullName;
			this.email = profile.email;
			this.phone = profile.phone;
			this.vcKeySelected = profile.vcKeySelected;
			this.language = profile.language;
			this.temporaryVc = profile.temporaryVc;
			this.symbolCurrency = profile.symbolCurrency;
			this.userId = profile.userId;
			this.enumRights = profile.enumRights;
			this.driveType = profile.driveType;
		}
	}
}
