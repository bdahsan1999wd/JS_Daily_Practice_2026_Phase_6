// PROBLEM-04 createEncryptedStorage()

function createEncryptedStorage(config) {

    // STEP 1: Validate Configuration

    const allowedStorageTypes = [
        "local",
        "session",
        "memory",
    ];

    const allowedAlgorithms = [
        "caesar",
        "reverse",
        "xor",
    ];

    if (
        !config ||
        typeof config !== "object" ||
        typeof config.secretKey !== "string" ||
        !config.secretKey.length ||
        !allowedStorageTypes.includes(
            config.storageType
        ) ||
        !allowedAlgorithms.includes(
            config.algorithm
        )
    ) {
        return "Invalid Input";
    }


    // STEP 2: State

    const storage = new Map();

    let currentKey = config.secretKey;
    let currentAlgorithm = config.algorithm;


    // STEP 3: Caesar Encryption

    function caesarEncrypt(text, key) {
        const shift =
            key.length % 26;

        let result = "";

        for (const char of text) {
            result += String.fromCharCode(
                char.charCodeAt(0) + shift
            );
        }

        return result;
    }

    function caesarDecrypt(text, key) {
        const shift =
            key.length % 26;

        let result = "";

        for (const char of text) {
            result += String.fromCharCode(
                char.charCodeAt(0) - shift
            );
        }

        return result;
    }


    // STEP 4: Reverse Encryption

    function reverseText(text) {
        return [...text].reverse().join("");
    }


    // STEP 5: XOR Encryption

    function xorText(text, key) {
        const keyCode =
            key.charCodeAt(0);

        let result = "";

        for (const char of text) {
            result += String.fromCharCode(
                char.charCodeAt(0) ^ keyCode
            );
        }

        return result;
    }


    // STEP 6: Encrypt

    function encrypt(text, key, algorithm) {
        switch (algorithm) {
            case "caesar":
                return caesarEncrypt(text, key);

            case "reverse":
                return reverseText(text);

            case "xor":
                return xorText(text, key);

            default:
                return "Invalid Input";
        }
    }


    // STEP 7: Decrypt

    function decrypt(text, key, algorithm) {
        switch (algorithm) {
            case "caesar":
                return caesarDecrypt(text, key);

            case "reverse":
                return reverseText(text);

            case "xor":
                return xorText(text, key);

            default:
                return "Invalid Input";
        }
    }


    // STEP 8: Set Secure

    function setSecure(key, value) {
        if (
            typeof key !== "string" ||
            !key.trim()
        ) {
            return "Invalid Input";
        }

        const json = JSON.stringify(value);

        const encrypted = encrypt(
            json,
            currentKey,
            currentAlgorithm
        );

        storage.set(key, {
            encrypted,
            algorithm: currentAlgorithm,
            key: currentKey,
        });

        return {
            success: true,
            encryptedPreview:
                encrypted.slice(0, 10),
        };
    }


    // STEP 9: Get Secure

    function getSecure(key) {
        if (typeof key !== "string") {
            return null;
        }

        const item = storage.get(key);

        if (!item) {
            return null;
        }

        try {
            const decrypted = decrypt(
                item.encrypted,
                item.key,
                item.algorithm
            );

            return JSON.parse(decrypted);
        } catch {
            return null;
        }
    }


    // STEP 10: Is Encrypted

    function isEncrypted(key) {
        if (typeof key !== "string") {
            return false;
        }

        const item = storage.get(key);

        if (!item) {
            return false;
        }

        return (
            typeof item.encrypted === "string" &&
            item.encrypted.length > 0
        );
    }


    // STEP 11: Rotate Encryption

    function rotate(newKey, newAlgorithm) {
        if (
            typeof newKey !== "string" ||
            !newKey.length ||
            ![
                "caesar",
                "reverse",
                "xor",
            ].includes(newAlgorithm)
        ) {
            return "Invalid Input";
        }

        const keys = [];

        for (const [key, item] of storage.entries()) {
            try {
                const decrypted = decrypt(
                    item.encrypted,
                    item.key,
                    item.algorithm
                );

                const reEncrypted = encrypt(
                    decrypted,
                    newKey,
                    newAlgorithm
                );

                storage.set(key, {
                    encrypted: reEncrypted,
                    algorithm: newAlgorithm,
                    key: newKey,
                });

                keys.push(key);
            } catch {
                // Skip corrupted entries.
            }
        }

        currentKey = newKey;
        currentAlgorithm = newAlgorithm;

        return {
            rotated: keys.length,
            keys,
        };
    }


    // STEP 12: Export

    function exportEncrypted() {
        const backup = {};

        for (const [key, item] of storage.entries()) {
            backup[key] = {
                encrypted: item.encrypted,
                algorithm: item.algorithm,
            };
        }

        return backup;
    }


    // STEP 13: Import

    function importEncrypted(backup) {
        if (
            !backup ||
            typeof backup !== "object" ||
            Array.isArray(backup)
        ) {
            return "Invalid Input";
        }

        let imported = 0;

        for (const [key, item] of Object.entries(backup)) {
            if (
                !item ||
                typeof item !== "object" ||
                typeof item.encrypted !== "string" ||
                ![
                    "caesar",
                    "reverse",
                    "xor",
                ].includes(item.algorithm)
            ) {
                return "Invalid Input";
            }

            storage.set(key, {
                encrypted: item.encrypted,
                algorithm: item.algorithm,
                key: currentKey,
            });

            imported++;
        }

        return {
            imported,
        };
    }


    // STEP 14: Report

    function getReport() {
        let totalCharacters = 0;

        for (const item of storage.values()) {
            totalCharacters +=
                item.encrypted.length;
        }

        const encryptedSize =
            totalCharacters * 2 / 1024;

        return {
            totalKeys: storage.size,
            algorithm: currentAlgorithm,
            storageType: config.storageType,
            encryptedSize:
                `${encryptedSize.toFixed(2)}KB`,
        };
    }

    return {
        setSecure,
        getSecure,
        isEncrypted,
        rotate,
        exportEncrypted,
        importEncrypted,
        getReport,
    };
}


// --- EXAMPLE USAGE ---

const encStorage = createEncryptedStorage({
    secretKey: "mySecret",
    storageType: "memory",
    algorithm: "caesar",
});


console.log(
    "Set Secure:",
    encStorage.setSecure(
        "user",
        {
            name: "Rahim",
            role: "admin",
        }
    )
);

console.log(
    "Get Secure:",
    encStorage.getSecure("user")
);

console.log(
    "Is Encrypted:",
    encStorage.isEncrypted("user")
);

console.log(
    "Encrypted Backup:",
    encStorage.exportEncrypted()
);

console.log(
    "Rotate:",
    encStorage.rotate(
        "newSecret",
        "reverse"
    )
);

console.log(
    "After Rotation:",
    encStorage.getSecure("user")
);

console.log(
    "Report:",
    encStorage.getReport()
);