// const BASE_URL = 'https://isproj2.ingen.com.ph';
const BASE_URL = 'http://localhost:3001';
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

    // Try to parse response
    const data = await res.json().catch(() => ({}));

    // If token-based route and unauthorized, redirect
    if (auth && res.status === 401) {
        localStorage.removeItem(LS_KEY);
        window.location.href = '/';
        return Promise.reject(new Error("Invalid or expired token"));
    }

    // Handle other errors
    if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP ${res.status}`);
    }

    return data;
}

// Auth
export function signup(email, password, accountType) {
    return request('POST', '/api/auth/signup', { email, password, accountType });
}
export async function loginWithEmail(email, password) {
    const data = await request('POST', '/api/auth/login', { email, password });
    if (data && data.token) {
        localStorage.setItem(LS_KEY, data.token);
    }
    return data;
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
export function resendOtp(email) {
    return request('POST', '/api/auth/resend-otp', { email });
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
export function deleteUser(userId) {
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

export function listGuardians() {
    return request('GET', '/api/admin/guardians', null, true);
}

export function getGuardianBoundUsers(guardianId) {
    return request('GET', `/api/admin/guardians/${guardianId}/bound-users`, null, true);
}


export function getUserById(userId) {
   return request('GET', `/api/admin/users/${userId}`, null, true);
}

export function updateUser(userId, data) {
   return request('PUT', `/api/admin/users/${userId}`, data, true);
}

export function getAuditTrail(startDate, endDate, search) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (search) params.append('search', search);
    return request('GET', `/api/admin/audit-trail?${params.toString()}`, null, true);
}



export function getConversationHistory(conversationId) {
    return request('GET', `/api/admin/conversations/${conversationId}/history`, null, true);
}

export function getUserGuardians(userId) {
    return request('GET', `/api/admin/users/${userId}/guardians`, null, true);
}

export function bindGuardian(userId, guardianId) {
    return request('POST', `/api/admin/users/${userId}/guardians`, { guardianId }, true);
}

export function unbindGuardian(userId, guardianId) {
    return request('DELETE', `/api/admin/users/${userId}/guardians/${guardianId}`, null, true);
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

export function getUserActivityAdmin(userId) {
    return request('GET', `/api/admin/users/${userId}/activity`, null, true);
}

export function getUserTransactions(userId) {
    return request('GET', `/api/admin/users/${userId}/transactions`, null, true);
}

export function makeUserPremium(userId) {
    return request('PUT', `/api/admin/users/${userId}/make-premium`, null, true);
}

export function removeUserPremium(userId) {
    return request('PUT', `/api/admin/users/${userId}/remove-premium`, null, true);
}
