import React, { useState, useEffect, useRef } from "react";
import { playSynthSound } from "./sound";

export function CryptoDemo() {
  const [cryptoMessage, setCryptoMessage] = useState("Let's review the calculus answers together!");
  const [cryptoStage, setCryptoStage] = useState<"plain" | "encrypting" | "cipher" | "transmitting" | "decrypting" | "done">("plain");
  const [scrambledText, setScrambledText] = useState(cryptoMessage);
  
  const scrambleIntervalRef = useRef<any>(null);
  const cryptoTimeoutsRef = useRef<any[]>([]);

  const clearCryptoTimers = () => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
      scrambleIntervalRef.current = null;
    }
    cryptoTimeoutsRef.current.forEach((id) => clearTimeout(id));
    cryptoTimeoutsRef.current = [];
  };

  const scheduleTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    cryptoTimeoutsRef.current.push(id);
  };

  useEffect(() => {
    // Unmount cleanup
    return () => {
      clearCryptoTimers();
    };
  }, []);

  const startCryptoProcess = () => {
    if (cryptoStage !== "plain" && cryptoStage !== "done") return;
    
    clearCryptoTimers();
    playSynthSound("click");
    setCryptoStage("encrypting");
    
    // Scramble letters
    let tickCount = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";
    
    scrambleIntervalRef.current = setInterval(() => {
      setScrambledText((prev) => 
        prev.split("").map((c, i) => {
          if (c === " ") return " ";
          // Gradually fix characters from left to right as time goes on
          if (i < tickCount * 4) {
            return "x";
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      playSynthSound("tick");

      tickCount++;
      if (tickCount > 10) {
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }
        
        // Solidify to hex block
        setScrambledText("0x3FA91B2E00C6758410EFDC7B9923AA991206C55B");
        setCryptoStage("cipher");

        // Start Transmission
        scheduleTimeout(() => {
          setCryptoStage("transmitting");
          
          // Travel across pipeline
          scheduleTimeout(() => {
            setCryptoStage("decrypting");
            
            // Decrypt scramble back
            let decryptTick = 0;
            const originalWords = cryptoMessage.split("");
            
            scrambleIntervalRef.current = setInterval(() => {
              setScrambledText(() => 
                originalWords.map((char, index) => {
                  if (char === " ") return " ";
                  if (index < decryptTick * 4) return char;
                  return chars[Math.floor(Math.random() * chars.length)];
                }).join("")
              );
              playSynthSound("tick");
              
              decryptTick++;
              if (decryptTick > 10) {
                if (scrambleIntervalRef.current) {
                  clearInterval(scrambleIntervalRef.current);
                  scrambleIntervalRef.current = null;
                }
                setScrambledText(cryptoMessage);
                setCryptoStage("done");
                playSynthSound("success");
              }
            }, 80);

          }, 1500);
        }, 1000);
      }
    }, 80);
  };

  const handleResetCrypto = () => {
    playSynthSound("click");
    clearCryptoTimers();
    setCryptoStage("plain");
    setScrambledText(cryptoMessage);
  };

  return (
    <>
      <span className="lp-demo-tag lp-tag-crypto">Encryption Block</span>
      <h3>E2E Message Encryptor</h3>
      <p className="lp-demo-desc">
        We use local 2048-bit RSA keys. Test encryption on the browser; watch client text scramble and descramble at recipient side.
      </p>
      
      <div className="lp-demo-interactive">
        <div className="lp-crypto-panel">
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            {/* Sender Bubble */}
            <div className="lp-crypto-bubble" style={{ flex: 1 }}>
              <div className="lp-crypto-bubble-header">
                <span>Alice (You)</span>
                <span className="lp-crypto-key-badge">RSA Public</span>
              </div>
              {cryptoStage === "plain" ? (
                <input 
                  type="text" 
                  aria-label="Secure message input"
                  value={cryptoMessage} 
                  onChange={(e) => { 
                    setCryptoMessage(e.target.value); 
                    setScrambledText(e.target.value); 
                  }}
                  style={{ background: "none", border: "none", padding: 0, fontSize: "0.85rem", color: "#ffffff", width: "100%" }}
                />
              ) : (
                <div className="lp-crypto-text">{cryptoMessage}</div>
              )}
            </div>

            {/* Recipient Bubble */}
            <div className="lp-crypto-bubble" style={{ flex: 1 }}>
              <div className="lp-crypto-bubble-header">
                <span>Bob (Friend)</span>
                <span className="lp-crypto-key-badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>Bob's Private</span>
              </div>
              <div className="lp-crypto-text" style={{ color: cryptoStage === "done" ? "#ffffff" : "#71717a" }}>
                {cryptoStage === "plain" && "Waiting for encryption..."}
                {cryptoStage === "encrypting" && scrambledText}
                {cryptoStage === "cipher" && scrambledText}
                {cryptoStage === "transmitting" && scrambledText}
                {cryptoStage === "decrypting" && scrambledText}
                {cryptoStage === "done" && scrambledText}
              </div>
            </div>
          </div>

          {/* Dotted Sync Pipeline */}
          <div className="lp-crypto-pipeline">
            <div className="lp-crypto-pipeline-line" />
            {cryptoStage !== "plain" && (
              <div className={`lp-crypto-pipeline-dot ${cryptoStage === "transmitting" ? "animating" : ""}`} />
            )}
            <span style={{ position: "absolute", bottom: -8, fontSize: "0.68rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#17191d", padding: "0 6px" }}>
              {cryptoStage === "plain" && "Pre-encryption"}
              {cryptoStage === "encrypting" && "Encrypting RSA-2048 Client-Side..."}
              {cryptoStage === "cipher" && "Payload Scrambled"}
              {cryptoStage === "transmitting" && "Transmitting over Convex SSL..."}
              {cryptoStage === "decrypting" && "Decrypting Private Key..."}
              {cryptoStage === "done" && "Secure Match Achieved"}
            </span>
          </div>

          <div className="lp-crypto-actions">
            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={startCryptoProcess}
              disabled={cryptoStage !== "plain" && cryptoStage !== "done"}
            >
              🔐 Encrypt & Send
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm" 
              onClick={handleResetCrypto}
            >
              Clear Demo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
