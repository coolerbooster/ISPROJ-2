const BASE_URL = 'https://isproj2.ingen.com.ph';
const LS_KEY = 'jwt_token';

function getToken() {
    return localStorage.getItem(LS_KEY) || '';
}

function headers(auth = false) {
    const h = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) h['Authorization'] = 'Bearer ' + token;
    }
    return h;
}

async function request(method, path, body = null, auth = false) {
    const opts = { method, headers: headers(auth) };
    if (body !== null) opts.body = JSON.stringify(body);

    const res = await fetch(BASE_URL + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP ${res.status}`);
    }
    return data;
}

// Auth
export function signup(email, password, accountType) {
    return request('POST', '/api/auth/signup', { email, password, accountType });
}
export function loginWithEmail(email, password) {
    return request('POST', '/api/auth/login', { email, password });
}
export function verifyOTP(email, codeValue) {
    return request('POST', '/api/auth/verify-login', { email, codeValue });
}
export function forgotPassword(email) {
    return request('POST', '/api/auth/forgot-password', { email });
}
export function resetPassword(email, codeValue, newPassword) {
    return request('POST', '/api/auth/reset-password', { email, codeValue, newPassword });
}

// User
export function getUserDashboard() {
    return request('GET', '/api/user/dashboard', null, true);
}
export function getUserProfile() {
    return request('GET', '/api/user/profile', null, true);
}
export function createOcrScan(recognizedText, text) {
    return request('POST', '/api/user/ocr-scans', { recognizedText, text }, true);
}
export function createObjectScan(recognizedObjects, text) {
    return request('POST', '/api/user/object-scans', { recognizedObjects, text }, true);
}
export function listMyScans() {
    return request('GET', '/api/user/scans', null, true);
}
export function getScan(scanId) {
    return request('GET', `/api/user/scans/${scanId}`, null, true);
}
export function updateScan(scanId, type, name, text) {
    return request('PUT', `/api/user/scans/${scanId}`, { type, name, text }, true);
}
export function deleteScan(scanId) {
    return request('DELETE', `/api/user/scans/${scanId}`, null, true);
}

//  Guardian
export function bindRequest(userEmail) {
    return request('POST', '/api/user/guardian/bind-request', { email: userEmail }, true);
}
export function bindConfirm(userEmail, codeValue) {
    return request('POST', '/api/user/guardian/bind-confirm', { email: userEmail, codeValue }, true);
}
export function getBoundUsers() {
    return request('GET', '/api/user/guardian/bound-users', null, true);
}
export function getScansByUser(userId) {
    return request('GET', `/api/user/scans/user?user_id=${userId}`, null, true);
}

// Admin
export function getAdminDashboard() {
    return request('GET', '/api/admin/dashboard', null, true);
}
export function createUserAsAdmin(email, password, accountType, isPremiumUser, scanCount) {
    return request('POST', '/api/admin/users', { email, password, accountType, isPremiumUser, scanCount }, true);
}
export function listUsersAdmin(page, limit, search = '') {
    let path = `/api/admin/users?page=${page}&limit=${limit}`;
    if (search.trim()) {
        path += `&search=${encodeURIComponent(search)}`;
    }
    return request('GET', path, null, true);
}
export function getUserDetailAdmin(userId) {
    return request('GET', `/api/admin/users/${userId}`, null, true);
}
export function updateUserAdmin(userId, email, accountType, isPremiumUser, scanCount) {
    return request('PUT', `/api/admin/users/${userId}`, { email, accountType, isPremiumUser, scanCount }, true);
}
export function updateUserPasswordAdmin(userId, password) {
    return request('PUT', `/api/admin/users/${userId}/password`, { password }, true);
}
export function deleteUserAdmin(userId) {
    return request('DELETE', `/api/admin/users/${userId}`, null, true);
}
export function getUserScansAdmin(userId) {
    return request('GET', `/api/admin/users/${userId}/scans`, null, true);
}
export function updateScanAdmin(scanId, type, name, text) {
    return request('PUT', `/api/admin/scans/${scanId}`, { type, name, text }, true);
}
export function deleteScanAdmin(scanId) {
    return request('DELETE', `/api/admin/scans/${scanId}`, null, true);
}
export function generateReport(date) {
    return request('GET', `/api/admin/report?date=${date}`, null, true);
}


export function getAuditTrail(startDate, endDate) {
    if (!startDate || !endDate) {
        throw new Error('Both startDate and endDate are required.');
    }

    return request(
        'GET',
        `/api/admin/audit-trail?startDate=${startDate}&endDate=${endDate}`,
        null,
        true
    );
}


export function getUserLogs(userId) {
    return request('GET', `/api/admin/users/${userId}/logs`, null, true);
}


export async function getImageByConversationId(conversationId) {
    const res = await fetch(`${BASE_URL}/api/admin/scans/${conversationId}/images`, {
        method: 'GET',
        headers: headers(true)
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch image: HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(" Raw image response from API:", data);

    const base64 = data.image || data.base64 || data.data || data.images;
    return { image: base64 };
}
