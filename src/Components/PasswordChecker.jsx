import React, { useState } from "react";
import "./CSS/PasswordChecker.css";
import commonPasswords from './cmn-pass.js';

const PasswordChecker = () => {
    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState("");
    const [stColor, setStColor] = useState("");
    const [timeToCrack, setTimeToCrack] = useState("0 seconds");
    const [passLength, setPassLength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [criteria, setCriteria] = useState({
        lowercase: false,
        uppercase: false,
        digit: false,
        symbol: false,
    });

    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;':,.<>?";
    const allCharacters = upperCase + lowerCase + numbers + symbols;

    const handleChange = (e) => {
        const pwd = e.target.value;
        setPassword(pwd);
        calculateStrength(pwd);
    };

    const resetState = () => {
        setStrength("");
        setCriteria({ lowercase: false, uppercase: false, digit: false, symbol: false });
        setTimeToCrack("0 seconds");
        setPassLength(0);
    };

    const calculateStrength = (pwd) => {
        if (!pwd) return resetState();

        const tests = {
            lowercase: /[a-z]/.test(pwd),
            uppercase: /[A-Z]/.test(pwd),
            digit: /\d/.test(pwd),
            symbol: /[\W_]/.test(pwd),
        };

        setCriteria(tests);
        setPassLength(pwd.length);

        let score = Object.values(tests).filter(Boolean).length +
            (pwd.length >= 8) + (pwd.length >= 12) + (pwd.length >= 16);

        if (isCommonPassword(pwd)) {
            setStrength("Weak (Common Password)");
            setStColor("red");
            setTimeToCrack("Instantly");
            return;
        }

        setStrength(score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong");
        setStColor(score <= 2 ? "red" : score <= 4 ? "orange" : "lightgreen");
        setTimeToCrack(calculateTimeToCrack(pwd, tests));
    };

    const isCommonPassword = (pwd) => {
        if (commonPasswords.includes(pwd.toLowerCase()))
            return true;
        else
            return false;
    };

    const calculateTimeToCrack = (pwd, charPools) => {
        const chart = {
            numbersOnly: [
                "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "Instantly",
                "1 sec", "5 secs", "1 min", "32 mins", "1 sec", "5 secs", "52 secs", "9 mins", "1 hour",
                "14 hours", "6 days"
            ],
            lowercase: [
                "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "Instantly",
                "Instantly", "3 secs", "1 min", "32 mins", "14 hours", "2 weeks", "1 year", "27 years",
                "713 years", "18k years", "481k years"
            ],
            upperAndLowercase: [
                "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "1 sec",
                "28 secs", "24 mins", "21 hours", "1 month", "6 years", "332 years", "17k years", "898k years",
                "46m years", "2bn years", "126bn years"
            ],
            allCharacters: [
                "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "Instantly", "2 secs",
                "2 mins", "2 hours", "5 days", "10 months", "53 years", "3k years", "202k years", "12m years",
                "779m years", "48bn years", "2tn years"
            ],
            symbolsOnly: [
                "Instantly", "Instantly", "Instantly", "Instantly", "1 sec", "3 secs", "10 secs",
                "1 min", "5 mins", "32 mins", "2 hours", "1 day", "3 days", "1 week", "3 months",
                "2 years", "10 years", "100 years"
            ]
        };
        

        const getCharacterPoolType = (charPools) => {
            if (charPools.lowercase && charPools.uppercase && charPools.digit && charPools.symbol) {
                return "allCharacters";
            } else if (charPools.lowercase && charPools.uppercase) {
                return "upperAndLowercase";
            } else if (charPools.lowercase || charPools.uppercase) {
                return "lowercase";
            } else if (charPools.digit) {
                return "numbersOnly";
            }
            return "symbolsOnly";
        };

        const characterPoolType = getCharacterPoolType(charPools);
        console.log(characterPoolType);
        
        const passwordLength = Math.min(pwd.length, 18);

        let timeToCrack = chart[characterPoolType][passwordLength - 1];

        if (/(.)\1{2,}/.test(pwd)) {
            timeToCrack = "10 seconds";
        }
        return timeToCrack;
    };

    const generatePassword = () => {
        let newPassword =
            upperCase[Math.floor(Math.random() * upperCase.length)] +
            lowerCase[Math.floor(Math.random() * lowerCase.length)] +
            numbers[Math.floor(Math.random() * numbers.length)] +
            symbols[Math.floor(Math.random() * symbols.length)];

        while (newPassword.length < 12) {
            newPassword += allCharacters[Math.floor(Math.random() * allCharacters.length)];
        }

        setPassword(newPassword);
        calculateStrength(newPassword);
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
                    onClick={() => setShowPassword(!showPassword)}
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