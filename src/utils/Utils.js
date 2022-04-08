
export function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
export function validatePostBe(post) {
    const re = /^\d{4}$/;
    return re.test(post);
}
export function validatePostFrench(post) {
    const re = /^\d{5}$/;
    return re.test(post);
}