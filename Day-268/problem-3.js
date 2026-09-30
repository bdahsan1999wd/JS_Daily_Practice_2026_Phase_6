// PROBLEM-03 createCookieManager()

function createCookieManager(config) {

    // STEP 1: Validate Configuration

    const allowedSameSite = [
        "Strict",
        "Lax",
        "None",
    ];

    if (
        !config ||
        typeof config !== "object" ||
        typeof config.domain !== "string" ||
        !config.domain.trim() ||
        typeof config.defaultPath !== "string" ||
        !config.defaultPath.startsWith("/") ||
        typeof config.secure !== "boolean" ||
        !allowedSameSite.includes(config.sameSite)
    ) {
        return "Invalid Input";
    }


    // STEP 2: Internal Cookie Storage

    const cookies = new Map();


    // STEP 3: Validate Name

    function validName(name) {
        return (
            typeof name === "string" &&
            name.trim().length > 0 &&
            !/[;=\s]/.test(name)
        );
    }


    // STEP 4: Serialize Cookie

    function serialize(name, value, options = {}) {
        if (!validName(name)) {
            return "Invalid Input";
        }

        if (
            options.maxAge !== undefined &&
            (
                typeof options.maxAge !== "number" ||
                !Number.isFinite(options.maxAge)
            )
        ) {
            return "Invalid Input";
        }

        const path =
            options.path ??
            config.defaultPath;

        const domain =
            options.domain ??
            config.domain;

        const secure =
            options.secure ??
            config.secure;

        const httpOnly =
            options.httpOnly ??
            false;

        const sameSite =
            options.sameSite ??
            config.sameSite;

        const parts = [
            `${name}=${encodeURIComponent(value)}`,
        ];

        if (options.maxAge !== undefined) {
            parts.push(`Max-Age=${options.maxAge}`);
        }

        if (options.expires !== undefined) {
            const expiresDate =
                options.expires instanceof Date
                    ? options.expires
                    : new Date(options.expires);

            if (Number.isNaN(expiresDate.getTime())) {
                return "Invalid Input";
            }

            parts.push(
                `Expires=${expiresDate.toUTCString()}`
            );
        }

        parts.push(`Path=${path}`);

        if (domain) {
            parts.push(`Domain=${domain}`);
        }

        if (secure) {
            parts.push("Secure");
        }

        if (httpOnly) {
            parts.push("HttpOnly");
        }

        if (sameSite) {
            parts.push(`SameSite=${sameSite}`);
        }

        return parts.join("; ");
    }


    // STEP 5: Set Cookie

    function set(name, value, options = {}) {
        if (!validName(name)) {
            return "Invalid Input";
        }

        const finalOptions = {
            ...options,
        };

        const maxAge = finalOptions.maxAge;

        const expiresAt =
            maxAge !== undefined
                ? Date.now() + maxAge * 1000
                : null;

        cookies.set(name, {
            value: String(value),
            options: {
                ...finalOptions,
                secure:
                    finalOptions.secure ??
                    config.secure,
                path:
                    finalOptions.path ??
                    config.defaultPath,
                domain:
                    finalOptions.domain ??
                    config.domain,
                sameSite:
                    finalOptions.sameSite ??
                    config.sameSite,
            },
            expiresAt,
        });

        return serialize(
            name,
            value,
            finalOptions
        );
    }


    // STEP 6: Get Cookie

    function get(name) {
        if (!validName(name)) {
            return null;
        }

        const cookie = cookies.get(name);

        if (!cookie) {
            return null;
        }

        if (
            cookie.expiresAt !== null &&
            cookie.expiresAt <= Date.now()
        ) {
            cookies.delete(name);
            return null;
        }

        return cookie.value;
    }


    // STEP 7: Get All

    function getAll() {
        const result = {};

        for (const [name, cookie] of cookies.entries()) {
            if (
                cookie.expiresAt !== null &&
                cookie.expiresAt <= Date.now()
            ) {
                cookies.delete(name);
                continue;
            }

            result[name] = cookie.value;
        }

        return result;
    }


    // STEP 8: Delete

    function deleteCookie(name, path = config.defaultPath) {
        if (!validName(name)) {
            return false;
        }

        if (!cookies.has(name)) {
            return false;
        }

        // Simulate deletion by setting Max-Age=0.
        cookies.delete(name);

        return serialize(
            name,
            "",
            {
                maxAge: 0,
                path,
            }
        );
    }


    // STEP 9: Has

    function has(name) {
        return get(name) !== null;
    }


    // STEP 10: Parse Cookie Header

    function parse(cookieString) {
        if (typeof cookieString !== "string") {
            return "Invalid Input";
        }

        if (cookieString.trim() === "") {
            return {};
        }

        const result = {};

        const parts = cookieString.split(";");

        for (const part of parts) {
            const index = part.indexOf("=");

            if (index === -1) {
                continue;
            }

            const name = part
                .slice(0, index)
                .trim();

            const value = part
                .slice(index + 1)
                .trim();

            if (!name) {
                continue;
            }

            try {
                result[name] =
                    decodeURIComponent(value);
            } catch {
                result[name] = value;
            }
        }

        return result;
    }


    // STEP 11: Secure Cookies

    function getSecureCookies() {
        const result = {};

        for (const [name, cookie] of cookies.entries()) {
            if (
                cookie.expiresAt !== null &&
                cookie.expiresAt <= Date.now()
            ) {
                continue;
            }

            if (cookie.options.secure === true) {
                result[name] = cookie.value;
            }
        }

        return result;
    }


    // STEP 12: Report

    function getReport() {
        let secureCookies = 0;
        let httpOnlyCookies = 0;
        let expiredCookies = 0;

        for (const cookie of cookies.values()) {
            if (
                cookie.expiresAt !== null &&
                cookie.expiresAt <= Date.now()
            ) {
                expiredCookies++;
                continue;
            }

            if (cookie.options.secure) {
                secureCookies++;
            }

            if (cookie.options.httpOnly) {
                httpOnlyCookies++;
            }
        }

        return {
            totalCookies: cookies.size,
            secureCookies,
            httpOnlyCookies,
            expiredCookies,
        };
    }

    return {
        set,
        get,
        getAll,
        delete: deleteCookie,
        has,
        parse,
        serialize,
        getSecureCookies,
        getReport,
    };
}


// --- EXAMPLE USAGE ---

const cookies = createCookieManager({
    domain: "example.com",
    defaultPath: "/",
    secure: true,
    sameSite: "Strict",
});


console.log(
    "Session Cookie:",
    cookies.set(
        "sessionId",
        "abc123",
        {
            maxAge: 3600,
            httpOnly: true,
        }
    )
);

console.log(
    "Theme Cookie:",
    cookies.set(
        "theme",
        "dark",
        {
            maxAge: 86400,
        }
    )
);

console.log(
    "Theme:",
    cookies.get("theme")
);

console.log(
    "All Cookies:",
    cookies.getAll()
);

console.log(
    "Has Session:",
    cookies.has("sessionId")
);

console.log(
    "Parsed:",
    cookies.parse(
        "name=Rahim; age=25; city=Dhaka"
    )
);

console.log(
    "Serialized:",
    cookies.serialize(
        "token",
        "xyz789",
        {
            maxAge: 900,
            secure: true,
        }
    )
);

console.log(
    "Secure Cookies:",
    cookies.getSecureCookies()
);

console.log(
    "Report:",
    cookies.getReport()
);