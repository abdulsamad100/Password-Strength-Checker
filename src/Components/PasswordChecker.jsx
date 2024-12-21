import React, { useState } from "react";
import sha1 from "js-sha1";
import "./CSS/PasswordChecker.css";

const PasswordChecker = () => {
    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState("");
    const [stColor, setStColor] = useState("");
    const [timeToCrack, setTimeToCrack] = useState("0 seconds");
    const [passLength, setPassLength] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [criteria, setCriteria] = useState({
        lowercase: false,
        uppercase: false,
        digit: false,
        symbol: false,
    });
    const length = 12;

    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = '0123456789';
    const symbols = "!@#$%^&*()_+-=[]{}|;':,.<>?";

    const allcharacters = upperCase + lowerCase + numbers + symbols;

    const countUniqueCharacters = (pwd) => {
        const uniqueChars = new Set(pwd);
        return uniqueChars.size;
    };

    const calculateStrength = async (pwd) => {
        if (pwd === "") {
            setStrength("");
            setCriteria({
                lowercase: false,
                uppercase: false,
                digit: false,
                symbol: false,
            });
            setTimeToCrack("0 seconds");
            setPassLength("")
            return;
        }
        setPassLength(pwd.length)
        const lowercase = /[a-z]/.test(pwd);
        const uppercase = /[A-Z]/.test(pwd);
        const digit = /\d/.test(pwd);
        const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

        setCriteria({ lowercase, uppercase, digit, symbol });

        let score = 0;

        if (lowercase) score += 1;
        if (uppercase) score += 1;
        if (digit) score += 1;
        if (symbol) score += 1;

        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (pwd.length >= 16) score += 1;

        const isPwned = await checkIfCommonPassword(pwd);
        if (isPwned) {
            setStrength("Weak (Common Password)");
            setStColor("red");
            setTimeToCrack("Instantly");
            return;
        }

        if (score <= 2) {
            setStrength("Weak");
            setStColor("red");
        } else if (score <= 4) {
            setStrength("Medium");
            setStColor("orange");
        } else if (score >= 5) {
            setStrength("Strong");
            setStColor("lightgreen");
        }

        calculateTimeToCrack(pwd, { lowercase, uppercase, digit, symbol });
    };

    function generatePassword() {
        let newPassword = '';
        newPassword += upperCase[Math.floor(Math.random() * upperCase.length)];
        newPassword += lowerCase[Math.floor(Math.random() * lowerCase.length)];
        newPassword += numbers[Math.floor(Math.random() * numbers.length)];
        newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    
        while (length > newPassword.length) {
            newPassword += allcharacters[Math.floor(Math.random() * allcharacters.length)];
        }
        
        setPassword(newPassword); // Set the password in the state
        handleChange({ target: { value: newPassword } }); // Trigger handleChange to update criteria and strength
    }    

    const checkIfCommonPassword = async (pwd) => {
        const hash = sha1(pwd).toUpperCase();
        const hashPrefix = hash.substring(0, 5);
        const hashSuffix = hash.substring(5);

        try {
            const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
            const data = await response.text();
            const isPwned = data.split("\n").some(line => {
                const [suffix] = line.split(":");
                return suffix === hashSuffix;
            });

            return isPwned;
        } catch (error) {
            console.error("Error checking password:", error);
            return false;
        }
    };

    const calculateTimeToCrack = (pwd, charPools) => {
        const { lowercase, uppercase, digit, symbol } = charPools;
    
        // Dynamically determine the size of the character set used
        let characterSetSize = 0;
        if (lowercase) characterSetSize += lowerCase.length;
        if (uppercase) characterSetSize += upperCase.length;
        if (digit) characterSetSize += numbers.length;
        if (symbol) characterSetSize += symbols.length;
    
        const totalCombinations = Math.pow(characterSetSize, pwd.length);
        const guessesPerSecond = 1e9; // Assuming a computer can make 1 billion guesses per second
    
        let seconds = totalCombinations / guessesPerSecond;
    
        // Penalize repetitive or simple patterns for faster cracking
        if (/(.)\1{2,}/.test(pwd)) { // e.g., "aaa", "111", "!!!"
            seconds = Math.min(seconds, 10); // Reduce time for repetitive patterns
        }
    
        const formatTime = (value, unit) => `${value.toFixed(4)} ${unit}`;
    
        // Format the cracking time into a human-readable form
        let displayTime = "";
        if (seconds < 1) {
            displayTime = "Instantly";
        } else if (seconds < 60) {
            displayTime = formatTime(seconds, "seconds");
        } else if (seconds < 3600) {
            displayTime = formatTime(seconds / 60, "minutes");
        } else if (seconds < 86400) {
            displayTime = formatTime(seconds / 3600, "hours");
        } else if (seconds < 31536000) {
            displayTime = formatTime(seconds / 86400, "days");
        } else if (seconds < 3153600000) {
            displayTime = `${(seconds / 31536000).toFixed(2)} years`;
        } else if (seconds < 3153600000000) {
            displayTime = `${(seconds / 3153600000).toFixed(2)} thousand years`;
        } else if (seconds < 3153600000000000) {
            displayTime = `${(seconds / 3153600000000).toFixed(2)} million years`;
        } else if (seconds < 3153600000000000000) {
            displayTime = `${(seconds / 3153600000000000).toFixed(2)} billion years`;
        } else {
            displayTime = `${(seconds / 3153600000000000000).toFixed(2)} trillion years`;
        }
    
        setTimeToCrack(displayTime);
    };
 
    const handleChange = (e) => {
        const pwd = e.target.value;
        setPassword(pwd);
        calculateStrength(pwd);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-checker">
            <h1>Password Strength Checker</h1>
            <div className="input-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="password-input"
                />
                <span
                    className="toggle-visibility"
                    onClick={togglePasswordVisibility}
                >
                    {showPassword ? "🙉" : "🙈"}
                </span>
            </div>

            <button onClick={generatePassword}>
                Generate Random
            </button>

            <div className="strength-indicator">
                <p>
                    Password Strength:{" "}
                    <strong style={{ color: stColor }}>{strength}</strong>
                </p>
            </div>
            <div className="criteria">
                <p>Criteria:</p>
                <ul>
                    <li className={criteria.lowercase ? "met" : ""}>Lowercase Letter</li>
                    <li className={criteria.uppercase ? "met" : ""}>Uppercase Letter</li>
                    <li className={criteria.digit ? "met" : ""}>Digit</li>
                    <li className={criteria.symbol ? "met" : ""}>Symbol</li>
                </ul>
            </div>
            <div className="criteria">
                <p>Password Length: {passLength ? passLength : 0}</p>
            </div>
            <div className="time-to-crack">
                <p>
                    Estimated Time to Crack: <strong>{timeToCrack}</strong>
                </p>
            </div>
        </div>
    );
};

export default PasswordChecker;
