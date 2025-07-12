const { isValidRegex, validateLength } = require("./field-validators");
const { nameLength, passwordLength, fullPhoneNumberLength, emailLength, countryCodeLength, phoneNumberLength, userIDLength } = require("../configs/fields-length.config");
const { nameRegex, emailRegex, strongPasswordRegex, fullPhoneNumberRegex, countryCodeRegex, numberRegex, userIDRegex } = require("../configs/regex.config");
const { logWithTime } = require("./time-stamps.utils");
const { throwInvalidResourceError } = require("../configs/error-handler.configs");

const isValidEmail = (emailID,res) => {
    if (!validateLength(emailID,emailLength.min,emailLength.max)) {
        logWithTime(`Invalid Email ID Length`);
        throwInvalidResourceError(res, `Email ID, Email ID must be at least ${emailLength.min} characters long and not more than ${emailLength.max} characters`);
        return false;
    }
    if(!isValidRegex(emailID,emailRegex)){
        logWithTime(`Invalid Email ID Format`);
        throwInvalidResourceError(res, "Email ID format. Email ID should have:- 🔹 Have no spaces,🔹 Contain exactly one @,🔹 Include a valid domain like .com, .in, etc.");
        return false;
    } 
    return true;
}

const isValidUserID = (userID,res) => {
    if(userID.length !== userIDLength.len){
        logWithTime(`Invalid User ID Length provided`);
        throwInvalidResourceError(res, `User ID, User ID must contain ${userIDLength.len} alpanumeric characters`);
        return false;
    }
    if(!isValidRegex(userID,userIDRegex)){
        logWithTime(`Invalid User ID Format provided`);
        throwInvalidResourceError(
            res,
            "User ID Format, Please enter a valid user ID that is of format XYZ(digit between 0-9)1(5 digits) .",
        );
        return false;
    }
    return true;
}

const isValidFullPhoneNumber = (fullPhoneNumber,res) => {
    if(!validateLength(fullPhoneNumber,fullPhoneNumberLength.min,fullPhoneNumberLength.max)){
        logWithTime(`Invalid Full Phone Number Length provided`);
        throwInvalidResourceError(res, `Full Phone Number, Full Phone Number must be at least ${fullPhoneNumberLength.min} digits long and not more than ${fullPhoneNumberLength.max} digits`);
        return false;
    }
    if(!isValidRegex(fullPhoneNumber,fullPhoneNumberRegex)){
        logWithTime(`Invalid Full Phone Number Format provided`);
        throwInvalidResourceError(
            res,
            "Full phone number Format, Please enter a valid full phone number that consist of only numeric digits .",
        );
        return false;
    }
    return true;
}

const isValidPassword = (password, res) => {
    // Check for minimum length
    if (!validateLength(password,passwordLength.min,passwordLength.max)) {
        logWithTime("Invalid Password Length");
        throwInvalidResourceError(res, `Password, Password must be at least ${passwordLength.min} characters long and not more than ${passwordLength.max} characters`);
        return false;
    }
    // Strong Password Format: At least one letter, one digit, and one special character
    if (!isValidRegex(password,strongPasswordRegex)) {
        logWithTime("Invalid Password format");
        throwInvalidResourceError(
            res,
            "Password, Password must contain at least one letter, one number, and one special character",
        );
        return false;
    }
    return true;
}

const isValidNumber = (number,res) => {
    if(!validateLength(number,phoneNumberLength.min,phoneNumberLength.max)){
        logWithTime(`Invalid Number Length provided`);
        throwInvalidResourceError(res, `Number, Number must be at least ${phoneNumberLength.min} digits long and not more than ${phoneNumberLength.max} digits`);
        return false;
    }
    if(!isValidRegex(number,numberRegex)){
        logWithTime(`Invalid Number Format provided`);
        throwInvalidResourceError(
            res,
            "Phone Number Format, Please enter a valid phone number that consist of only numeric digits .",
        );
        return false;
    }
    return true;
}

const isValidCountryCode = (countryCode,res) => {
    if(!validateLength(countryCode,countryCodeLength.min,countryCodeLength.max)){
        logWithTime(`Invalid Country Code Length provided`);
        throwInvalidResourceError(res, `Country Code length, Country Code length must be at least ${countryCodeLength.min} digits long and not more than ${countryCodeLength.max} digits`);
        return false;
    }
    if(!isValidRegex(countryCode,countryCodeRegex)){
        logWithTime(`Invalid Country Code Format provided`);
        throwInvalidResourceError(
            res,
            `Country Code Format, Please enter a valid international country code number not starting from 0 and consist only numeric digits (e.g., 1 || 91 || 78)`,
        );
        return false;
    }
    return true;
}

const isValidName = (name,res) => {
    if(!validateLength(name,nameLength.min,nameLength.max)){
        logWithTime(`Invalid Name Length provided`);
        throwInvalidResourceError(res,`Name. Name must be between ${nameLength.min} and ${nameLength.max} characters.`);
        return false;
    }
    if(!isValidRegex(name,nameRegex)){
        logWithTime(`Invalid Name Format provided`);
        throwInvalidResourceError(res,"Name. Name can only include letters, spaces, apostrophes ('), periods (.), and hyphens (-).");
        return false;
    }
    return true;
}

module.exports = {
    isValidName: isValidName,
    isValidEmail: isValidEmail,
    isValidUserID: isValidUserID,
    isValidNumber: isValidNumber,
    isValidPassword: isValidPassword,
    isValidCountryCode: isValidCountryCode,
    isValidFullPhoneNumber: isValidFullPhoneNumber
}