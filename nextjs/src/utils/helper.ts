import { AiModalType } from '@/types/aimodels';

const CryptoJS = require('crypto-js');
const { AUTH, ENCRYPTION_KEY } = require('@/config/config');
const { BRAIN, LocalStorage } = require('./localstorage');
const disposableEmailDomains = require('disposable-email-domains');
const { MODEL_CREDIT_INFO } = require('./constant');
const { RESPONSE_STATUS_CODE, RESPONSE_STATUS } = require('./constant');
const crypto = require('crypto');

export const hourFormat = (duration) => {
    const dur = Number(duration);
    const hour = Math.floor((dur % 3600) / 60);
    const minutes = Math.floor((dur % 3600) % 60);
    const zeroHour = `0${hour}`;
    const zeroMinutes = `0${minutes}`;
    return `${hour.toString().length === 1 ? zeroHour : hour}:${
        minutes.toString().length === 1 ? zeroMinutes : minutes
    }:00`;
};

export const integerFormat = (duration) => {
    const dur = duration.split(':');
    return +dur[0] * 60 + +dur[1];
};

export const downloadSampleFile = (fileName) => {
    const encodedUri = encodeURI(`/files/${fileName}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.append(link);
    link.click();
};

export const decimalValue = (value:any = 0) => {
    return Number.isInteger(value)
        ? value
        : Number.parseFloat(value).toFixed(2);
};

export const NUMBER_REGEX = /^\d+$/;
export const FLOAT_REGEX = /^\d+\.?\d{0,2}$/;

export const REGEX = {
    ALPHANUMERIC: /^(?=.*[A-Za-z])(?=.*\d)[\dA-Za-z]+$/,
    FULLNAME: /^([A-Za-z]+|[A-Za-z]+\s[A-Za-z]+)+$/,
    ALPHANUMERIC_SPACE: /^(\w+|(\w+\s\w+)+)/,
    //PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+[\]{}|;:,<>./\\'`~"])[A-Za-z\d@$!%*?&#^()\-_=+[\]{}|;:,<>./\\'`~"]{8,}$/,
    EIGHTCHAR: /^.{8,}$/,
    UPPER_LOWER: /^(?=.*[A-Z])(?=.*[a-z]).*[A-Za-z].*$/,
    NUMBER_SPECIALCHAR:
        /^(?=.*\d)(?=.*[!"#$%&()*,.:<>?@^`{|}~]).*[\d!"#$%&()*,.:<>?@^`{|}~].*$/,
    BUSSINESS_NAME: /^([\dA-Za-z]+|[\dA-Za-z]+(\s[\d.A-Za-z]+)+)+$/,
    LISCENSE_NUM: /^[\dA-Za-z]+$/,
    ONLY_NUM: /^(\d)+$/,
    URL: /[\w#%()+./:=?@~]{2,256}\.[a-z]{2,6}\b([\w#%&+./:=?@~-]*)/,
    REPLACE_NUMBER_REGEX: /\D/g,
    CODE_REGEX: /^[\d_a-z]*$/,
    CODE_REPLACE_REGEX: /[^\w ]/gi,
    EMAIL_FORMAT_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    MOBILE: /^\+\d{1,3}\d{10}$/,
    EMAIL_DOMAIN_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export const formatProfile = (profile) => {
    return {
        name: profile.name,
        uri: profile.uri,
        mime_type: profile.mime_type,
        file_size: profile.file_size,
    }
}

export const formatCity = (city) => {
    return {
        nm: city.value,
        code: city.code,
        id: city.id,
    }
}

export const formatState = (state) => {
    return {
        nm: state.value,
        code: state.code,
        id: state.id,
    }
}

export const formatCountry = (country) => {
    return {
        nm: country.value,
        code: country.code,
        id: country.id,
    }
}

export const formatCompany = (company) => {
    return {
        name: company.companyNm,
        slug: company.slug,
        id: company._id
    }
}

export const formatBrain = (brain) => {
    return {
        title: brain?.title,
        slug: brain?.slug,
        id: brain?._id || brain?.id,
        isShare : brain?.isShare
    }
}

export const transformBrain = (brain, listOption = false) => { 
    if(listOption){
        return brain.map(item => { 
            return {
                title: item.label,
                slug: item.slug,
                id: item.id,
                isShare : item?.isShare
            }
        });
    } else {
        return brain.map(item => {
            return {
                label: item?.title,
                value: item?.slug,
                id: item?._id,
                isShare : item?.isShare
            }
        })
    }    
}

export const formatFileData = (file) => {
    return {
        name: file.name,
        uri: file.uri,
        mime_type: file.mime_type,
        type: file.type,
        id: file._id
    }
}

export const persistBrainData = (payload) => {
    const data = {
        _id: payload?._id,
        title: payload.title,
        slug: payload.slug,
        workspaceId: payload.workspaceId,
        companyId: payload.companyId,
        user: payload.user,
        isShare: payload.isShare,
        createdAt: payload.createdAt
    };

    encryptedPersist(data, BRAIN);
};

export const retrieveBrainData = () => {
    return decryptedPersist(BRAIN);
};

export const encryptedPersist = (payload, key) => {
    const jsonData = JSON.stringify(payload);
    // Encrypt the JSON string
    const encryptedData = CryptoJS.AES.encrypt(jsonData, AUTH.COOKIE_PASSWORD).toString();

    // Store encrypted data in LocalStorage
    LocalStorage.setJSON(key, encryptedData);
}

export const decryptedPersist = (key) => {
    const encryptedData = LocalStorage.getJSON(key);
    if (!encryptedData) return null;

    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, AUTH.COOKIE_PASSWORD);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    // Parse the JSON string back to an object
    return JSON.parse(decryptedData);
}

/**
 * Decrypts a Base64 encoded AES encrypted string using the provided encryption key.
 * 
 * @param {string} data - The Base64 encoded encrypted string to be decrypted.
 * @returns {string} The decrypted string in UTF-8 format.
 */
export const decryptedData = (data) => {
    const parsedKeys = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const decryptedText = CryptoJS.AES.decrypt(data, parsedKeys, { mode:CryptoJS.mode.ECB });
    return decryptedText.toString(CryptoJS.enc.Utf8);
}

export const encryptedData = (data) => {
    const parsedKeys = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const encrypted = CryptoJS.AES.encrypt(data, parsedKeys, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

export const allowImageConversation = (selectedAIModal: AiModalType) => {
    const allowedModels = [
        'gpt-4o',
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-4.1-search-medium",
        "o4-mini",
        "o3-mini",
        "o3",
        "chatgpt-4o-latest",
        'claude-3-5-sonnet-latest',
        'claude-3-opus-latest',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-3-5-haiku-latest',
        'claude-3-7-sonnet-latest',
        'gemini-1.5-pro',
        'gemini-2.0-flash',
        'gemini-2.5-flash-preview-04-17',
        'gemini-2.5-pro-preview-05-06',
        'meta-llama/llama-4-scout',
        'meta-llama/llama-4-maverick',
       'qwen/qwen3-30b-a3b:free',
       'claude-sonnet-4-20250514',
       'claude-opus-4-20250514',
    ];
    const result = allowedModels.includes(selectedAIModal.name);
    return result;
}

export const calculateSubscriptionPrice = (units, priceInCents) => {
    // Convert price from cents to dollars (divide by 100)
    const priceInDollars = priceInCents / 100;
    // Calculate how many groups of 5 users are needed (rounding up)
    // const groupsOf5 = Math.ceil(units / 5);
    // Calculate total price based on number of groups
    return units * priceInDollars;
}

export const isDisposableEmail=(email:any) => {
    const domain = email.split('@')[1];
    return disposableEmailDomains.includes(domain);
}

export const isIndiaByTimezone = () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone.includes("Calcutta") || timeZone.includes("Kolkata");
}

export const sortArrayByBotCodeWithDisabledLast = (array:any) => {
    return array.sort((a, b) => {
        // Check if either object is disabled
        if (a.isDisable && !b.isDisable) return 1;
        if (!a.isDisable && b.isDisable) return -1;

        // Sort by bot.code if neither or both are disabled
        if (a.bot.code < b.bot.code) return -1;
        if (a.bot.code > b.bot.code) return 1;
        return 0;
    });
}

export const generateObjectId = () => {
    const machineId = crypto.randomBytes(3).toString('hex');
    const processId = crypto.randomBytes(2).toString('hex');
    let counter = Math.floor(Math.random() * 0xffffff);
    let lastTimestamp = Math.floor(Date.now() / 1000);
    const timestamp = Math.floor(Date.now() / 1000);
    
    if (timestamp !== lastTimestamp) {
        lastTimestamp = timestamp;
        counter = 0;
    } else {
        counter = (counter + 1) % 0xffffff;
    }

    const timestampHex = timestamp.toString(16).padStart(8, '0');
    const counterHex = counter.toString(16).padStart(6, '0');

    return timestampHex + machineId + processId + counterHex;
};

export const handleServerRefreshToken = (response) => {
    if(response.status === RESPONSE_STATUS.UNAUTHORIZED && response.code === RESPONSE_STATUS_CODE.REFRESH_TOKEN){
        return { status: RESPONSE_STATUS.UNAUTHORIZED, code: RESPONSE_STATUS_CODE.REFRESH_TOKEN }
    }
    return response.data;
}

export const formatMessageUser = (user) => {
    return {
        id: user._id,
        email: user.email,
        roleId: user.roleId,
        roleCode: user.roleCode,
        fname: user.fname,
        lname: user.lname,
        profile: user.profile,
    }
}

export function encodedObjectId(objectId: string) {
    if (!objectId) return;
    const buffer = Buffer.from(objectId, 'hex');
    const encoded = buffer.toString('base64');
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodedObjectId(encodedId: string) {
    if (!encodedId) return;
    const base64 = encodedId.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    const objectId = buffer.toString('hex');
    return objectId;
}

export const getModelCredit = (modelName) => {
    const modelInfo = MODEL_CREDIT_INFO.find(
        item => item.model === modelName
    );
    return modelInfo ? modelInfo.credit : 0;
}

export const hasDocumentFile = (files) => {
    return files.some(file => !file.mime_type?.startsWith("image/"));
}

export const hasImageFile = (files) => {
    return files.some(file => file.mime_type?.startsWith("image/"));
}

export function extractFileType(mimeType: string) {
    if (!mimeType) return '';
    const parts = mimeType.split('/');
    const subtype = parts[1];
    const mimeMap = {
        'msword': 'doc',
        'vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'vnd.ms-excel': 'xls',
        'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'vnd.ms-powerpoint': 'ppt',
        'vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/jpeg': 'jpg',
        'jpeg': 'jpg',
    };
    return mimeMap[subtype] || subtype;
}

export function allowImageGeneration(modelName: string) {
    const allowedModels = [
        'gpt-4o',
        'o3-mini',
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-4.1-search-medium",
        "o4-mini",
        "o3"
    ];
    return allowedModels.includes(modelName);
}

export function formatDateToISO(dateStr: string) {
    const cleanedDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const date = new Date(cleanedDateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const isUserNameComplete = (user) => {
    if(user?.fname === undefined || user?.lname === undefined){
        return false;
    }
    return true;
}

export const formatAgentRequestCopyData = (data: Record<string, unknown>, stringKeys: string[]): string => {
    return Object.entries(data)
        .map(([key, value]) => {
            let val = value;
            if (!stringKeys.includes(key) && typeof value === "string") {
                val = value.replace(/_/g, " ");
                return `${key}: ${val}`;
            }
            return undefined;
        })
        .filter(entry => entry !== undefined)
        .join(", ");
}

export const getDisplayModelName = (modelName: string) => {
    const modelInfo = MODEL_CREDIT_INFO.find(item => item.model === modelName);
    return modelInfo?.displayName || modelName;
}