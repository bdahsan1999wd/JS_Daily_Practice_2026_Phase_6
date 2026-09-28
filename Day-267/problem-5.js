// 🧩 PROBLEM–05: Form Security & Sanitization Engine

// Logic: This function creates a form security engine that handles CSRF token generation/validation, input sanitization based on configurable rules, rate limiting per submitter, XSS & SQL injection threat detection, and a running security report.

function createFormSecurityEngine(config) {

    // --- STEP 1: VALIDATE INPUT ---
    const validSanitizationRules = [
        "stripHTML", "escapeSQL", "trimWhitespace",
        "normalizeEmail", "removeDangerousChars"
    ];

    if (
        typeof config !== 'object' || config === null ||
        typeof config.csrfTokenLength !== 'number' ||
        config.csrfTokenLength <= 0 ||
        typeof config.maxSubmissionsPerMinute !== 'number' ||
        config.maxSubmissionsPerMinute <= 0 ||
        !Array.isArray(config.sanitizationRules) ||
        !config.sanitizationRules.every(r => validSanitizationRules.includes(r))
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL STATE ---
    let totalSubmissions = 0;
    let blockedSubmissions = 0;
    let threatsDetectedCount = 0;
    let sanitizedFieldsCount = 0;

    // Rate limiting: submitterId → { count, resetTime }
    const rateLimitMap = new Map();

    // --- STEP 3: GENERATE CSRF TOKEN ---
    function generateCSRF() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";
        for (let i = 0; i < config.csrfTokenLength; i++) {
            token += chars[Math.floor(Math.random() * chars.length)];
        }
        return token;
    }

    // --- STEP 4: VALIDATE CSRF TOKEN ---
    function validateCSRF(token, storedToken) {
        return token === storedToken;
    }

    // --- STEP 5: APPLY SINGLE SANITIZATION RULE ---
    function applyRule(value, rule, fieldType) {
        if (rule === "trimWhitespace") return value.trim();

        if (rule === "stripHTML") return value.replace(/<[^>]*>/g, "");

        if (rule === "escapeSQL") return value.replace(/['";\-\-]/g, match => `\\${match}`);

        if (rule === "normalizeEmail" && fieldType === "email") {
            return value.trim().toLowerCase();
        }

        if (rule === "removeDangerousChars") return value.replace(/[<>&{}]/g, "");

        return value;
    }

    // --- STEP 6: SANITIZE FORM DATA ---
    function sanitize(formData, fieldTypes = {}) {
        if (typeof formData !== 'object' || formData === null) return "Invalid Input";

        const sanitized = {};

        for (const [field, value] of Object.entries(formData)) {
            let val = String(value);
            const fieldType = fieldTypes[field] || "text";
            let changed = false;

            for (const rule of config.sanitizationRules) {
                const newVal = applyRule(val, rule, fieldType);
                if (newVal !== val) changed = true;
                val = newVal;
            }

            if (changed) sanitizedFieldsCount++;
            sanitized[field] = val;
        }

        return sanitized;
    }

    // --- STEP 7: CHECK RATE LIMIT ---
    function checkRateLimit(submitterId) {
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute

        if (!rateLimitMap.has(submitterId)) {
            rateLimitMap.set(submitterId, { count: 0, resetTime: now + windowMs });
        }

        const entry = rateLimitMap.get(submitterId);

        // Reset window if expired
        if (now > entry.resetTime) {
            entry.count = 0;
            entry.resetTime = now + windowMs;
        }

        const resetIn = Math.ceil((entry.resetTime - now) / 1000);

        if (entry.count >= config.maxSubmissionsPerMinute) {
            blockedSubmissions++;
            return { allowed: false, remainingSubmissions: 0, resetIn };
        }

        entry.count++;
        totalSubmissions++;

        return {
            allowed: true,
            remainingSubmissions: config.maxSubmissionsPerMinute - entry.count,
            resetIn
        };
    }

    // --- STEP 8: DETECT THREATS ---
    function detectThreats(formData) {
        if (typeof formData !== 'object' || formData === null) return "Invalid Input";

        const threats = [];

        // XSS patterns
        const xssPatterns = [/<script>/i, /javascript:/i, /onerror=/i];

        // SQL injection patterns
        const sqlPatterns = [/SELECT\s*\*/i, /DROP\s+TABLE/i, /--/, /1\s*=\s*1/i];

        for (const [field, value] of Object.entries(formData)) {
            const val = String(value);

            // Check XSS
            const xssMatches = xssPatterns
                .filter(p => p.test(val))
                .map(p => p.source.replace(/\\s\*/g, " ").replace(/\//g, ""));

            if (xssMatches.length > 0) {
                threats.push({ field, type: "XSS", detected: xssMatches.join(", ") });
            }

            // Check SQL injection
            const sqlMatches = [];
            if (/SELECT\s*\*/i.test(val)) sqlMatches.push("SELECT *");
            if (/DROP\s+TABLE/i.test(val)) sqlMatches.push("DROP TABLE");
            if (/--/.test(val)) sqlMatches.push("--");
            if (/1\s*=\s*1/i.test(val)) sqlMatches.push("1=1");

            if (sqlMatches.length > 0) {
                threats.push({ field, type: "SQL Injection", detected: sqlMatches.join(", ") });
            }
        }

        if (threats.length > 0) threatsDetectedCount += threats.length;

        return { safe: threats.length === 0, threats };
    }

    // --- STEP 9: GET SECURITY REPORT ---
    function getSecurityReport() {
        return {
            totalSubmissions,
            blockedSubmissions,
            threatsDetected: threatsDetectedCount,
            sanitizedFields: sanitizedFieldsCount
        };
    }

    // --- STEP 10: RETURN SECURITY ENGINE API ---
    return {
        generateCSRF,
        validateCSRF,
        sanitize,
        checkRateLimit,
        detectThreats,
        getSecurityReport
    };
}


// --- EXAMPLE USAGE ---
const security = createFormSecurityEngine({
    csrfTokenLength: 32,
    maxSubmissionsPerMinute: 5,
    sanitizationRules: ["stripHTML", "trimWhitespace", "normalizeEmail"]
});


const token = security.generateCSRF();
console.log(token.length);
console.log(security.validateCSRF(token, token));

console.log(security.sanitize(
    { name: "  <b>Rahim</b>  ", email: "  RAHIM@MAIL.COM  " },
    { name: "text", email: "email" }
));

console.log(security.detectThreats({
    username: "admin",
    query: "SELECT * FROM users WHERE 1=1 --"
}));

console.log(security.checkRateLimit("user123"));

console.log(security.getSecurityReport());


// --- Invalid Input ---
console.log(createFormSecurityEngine("invalid"));