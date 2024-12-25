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
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        };

        setCriteria(tests);
        setPassLength(pwd.length);

        let score = Object.values(tests).filter(Boolean).length +
            (pwd.length >= 8) + (pwd.length >= 12) + (pwd.length >= 16);

        if (isCommonPassword(pwd)) {
            console.log("weak");
            
            setStrength("Weak (Common Password)");
            setStColor("red");
            setTimeToCrack("Instantly");
            return;
        }

        setStrength(score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong");
        setStColor(score <= 2 ? "red" : score <= 4 ? "orange" : "lightgreen");
        calculateTimeToCrack(pwd, tests);
    };

    const isCommonPassword = (pwd) => {
        if (commonPasswords.includes(pwd.toLowerCase()))
            return true;
        else
            return false;
    };

    const calculateTimeToCrack = (pwd, charPools) => {
        const guessesPerSecond = 1e9;
        const characterSetSize =
            (charPools.lowercase ? lowerCase.length : 0) +
            (charPools.uppercase ? upperCase.length : 0) +
            (charPools.digit ? numbers.length : 0) +
            (charPools.symbol ? symbols.length : 0);

        const totalCombinations = Math.pow(characterSetSize, pwd.length);
        let seconds = totalCombinations / guessesPerSecond;

        if (/(.)\1{2,}/.test(pwd)) seconds = Math.min(seconds, 10);

        const timeUnits = [
            { value: 3153600000000000000, label: "trillion years" },
            { value: 3153600000000000, label: "billion years" },
            { value: 3153600000000, label: "million years" },
            { value: 3153600000, label: "thousand years" },
            { value: 31536000, label: "years" },
            { value: 86400, label: "days" },
            { value: 3600, label: "hours" },
            { value: 60, label: "minutes" },
            { value: 1, label: "seconds" },
        ];

        const displayTime = timeUnits.find(({ value }) => seconds >= value);
        setTimeToCrack(displayTime ? `${(seconds / displayTime.value).toFixed(2)} ${displayTime.label}` : "Instantly");
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
