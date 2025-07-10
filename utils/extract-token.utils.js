const extractAccessToken = (req) => {
    if(!req.cookies)return null;
    const accessToken = req.cookies.accessToken;
    if(accessToken)return accessToken;
    return null;
}

module.exports = {
    extractAccessToken: extractAccessToken
}