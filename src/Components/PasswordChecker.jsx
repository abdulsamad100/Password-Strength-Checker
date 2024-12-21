import React, { useState } from "react";
import sha1 from "js-sha1";
import "./CSS/PasswordChecker.css";

const PasswordChecker = () => {
    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState("");
    const [stColor, setStColor] = useState("");
    const [timeToCrack, setTimeToCrack] = useState("0 seconds");
    const [showPassword, setShowPassword] = useState(false);
    const [criteria, setCriteria] = useState({
        lowercase: false,
        uppercase: false,
        digit: false,
        symbol: false,
    });

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
            return;
        }

        const lowercase = /[a-z]/.test(pwd);
        const uppercase = /[A-Z]/.test(pwd);
        const digit = /\d/.test(pwd);
        const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

        setCriteria({ lowercase, uppercase, digit, symbol });

        let score = 0;

        // Scoring for character types
        if (lowercase) score += 1;
        if (uppercase) score += 1;
        if (digit) score += 1;
        if (symbol) score += 1;

        // Scoring for length
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (pwd.length >= 16) score += 1;

        // Check if the password is in the Have I Been Pwned database
        const isPwned = await checkIfCommonPassword(pwd);
        if (isPwned) {
            setStrength("Weak (Common Password)");
            setStColor("red");
            console.log(timeToCrack);
        }

        // Evaluate the strength based on score
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

        // Recalculate time to crack
        calculateTimeToCrack(pwd, { lowercase, uppercase, digit, symbol });
    };

    const checkIfCommonPassword = async (pwd) => {
        const hash = sha1(pwd).toUpperCase();
        const hashPrefix = hash.substring(0, 5);
        const hashSuffix = hash.substring(5);

        try {
            const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
            const data = await response.text();            
            const isPwned = data.split("\n").some(line => {
                const [suffix, count] = line.split(":");
                return suffix === hashSuffix;
            });

            return isPwned;
        } catch (error) {
            console.error("Error checking password:", error);
            return false;
        }
    };

    const calculateTimeToCrack = (pwd, charPools) => {
        let characterSetSize = 0;
        if (charPools.lowercase) characterSetSize += 26;
        if (charPools.uppercase) characterSetSize += 26;
        if (charPools.digit) characterSetSize += 10;
        if (charPools.symbol) characterSetSize += 32;

        const totalCombinations = Math.pow(characterSetSize, pwd.length);
        const guessesPerSecond = 1e9;
        const seconds = totalCombinations / guessesPerSecond;

        const minutes = seconds / 60;
        const hours = minutes / 60;
        const days = hours / 24;
        const years = days / 365;

        let displayTime = "";
        if (years >= 1) {
            displayTime = `${years.toFixed(2)} years`;
        } else if (days >= 1) {
            displayTime = `${days.toFixed(2)} days`;
        } else if (hours >= 1) {
            displayTime = `${hours.toFixed(2)} hours`;
        } else if (minutes >= 1) {
            displayTime = `${minutes.toFixed(2)} minutes`;
        } 
        else if(isPwned){
            displayTime = "Instantly";
        }
        else {
            displayTime = `${seconds.toFixed(2)} seconds`;
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
                    {showPassword ? "🙈" : "👁️"}
                </span>
            </div>

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
            <div className="time-to-crack">
                <p>
                    Estimated Time to Crack: <strong>{timeToCrack}</strong>
                </p>
            </div>
        </div>
    );
};

export default PasswordChecker;
