import React, { useCallback, useState, useEffect, useRef } from "react";
import { playSynthSound } from "./sound";
import { useLanguage } from "../../../hooks/useLanguage";

export function CryptoDemo() {
  const { t } = useLanguage();

  const [demoState, setDemoState] = useState(() => {
    const msg = t.landingPage.cryptoInitialMessage;
    return {
      message: msg,
      stage: "plain" as "plain" | "encrypting" | "cipher" | "transmitting" | "decrypting" | "done",
      scrambled: msg
    };
  });
  
  const scrambleIntervalRef = useRef<number | null>(null);
  const cryptoTimeoutsRef = useRef<number[]>([]);

  const clearCryptoTimers = useCallback(() => {
    if (scrambleIntervalRef.current !== null) {
      window.clearInterval(scrambleIntervalRef.current);
      scrambleIntervalRef.current = null;
    }
    cryptoTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    cryptoTimeoutsRef.current = [];
  }, []);

  // Update default message when language changes
  useEffect(() => {
    const msg = t.landingPage.cryptoInitialMessage;
    setDemoState({
      message: msg,
      scrambled: msg,
      stage: "plain"
    });
    clearCryptoTimers();
  }, [clearCryptoTimers, t.landingPage.cryptoInitialMessage]);

  const scheduleTimeout = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    cryptoTimeoutsRef.current.push(id);
  };

  useEffect(() => {
    return () => {
      clearCryptoTimers();
    };
  }, [clearCryptoTimers]);

  const startCryptoProcess = () => {
    if (demoState.stage !== "plain" && demoState.stage !== "done") return;
    
    clearCryptoTimers();
    playSynthSound("click");
    setDemoState(prev => ({ ...prev, stage: "encrypting" }));
    
    let tickCount = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";
    
    scrambleIntervalRef.current = window.setInterval(() => {
      setDemoState(prev => {
        const nextScrambled = prev.scrambled.split("").map((c, i) => {
          if (c === " ") return " ";
          if (i < tickCount * 4) {
            return "x";
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        return { ...prev, scrambled: nextScrambled };
      });
      playSynthSound("tick");

      tickCount++;
      if (tickCount > 10) {
        if (scrambleIntervalRef.current !== null) {
          window.clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }
        
        setDemoState(prev => ({
          ...prev,
          scrambled: "0x3FA91B2E00C6758410EFDC7B9923AA991206C55B",
          stage: "cipher"
        }));

        scheduleTimeout(() => {
          setDemoState(prev => ({ ...prev, stage: "transmitting" }));
          
          scheduleTimeout(() => {
            setDemoState(prev => ({ ...prev, stage: "decrypting" }));
            
            let decryptTick = 0;
            
            scrambleIntervalRef.current = window.setInterval(() => {
              setDemoState(prev => {
                const originalWords = prev.message.split("");
                const nextScrambled = originalWords.map((char, index) => {
                  if (char === " ") return " ";
                  if (index < decryptTick * 4) return char;
                  return chars[Math.floor(Math.random() * chars.length)];
                }).join("");
                return { ...prev, scrambled: nextScrambled };
              });
              playSynthSound("tick");
              
              decryptTick++;
              if (decryptTick > 10) {
                if (scrambleIntervalRef.current !== null) {
                  window.clearInterval(scrambleIntervalRef.current);
                  scrambleIntervalRef.current = null;
                }
                setDemoState(prev => ({
                  ...prev,
                  scrambled: prev.message,
                  stage: "done"
                }));
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
    setDemoState(prev => ({
      ...prev,
      stage: "plain",
      scrambled: prev.message
    }));
  };

  return (
    <>
      <span className="lp-demo-tag lp-tag-crypto">
        {t.landingPage.cryptoTag}
      </span>
      <h3>
        {t.landingPage.cryptoTitle}
      </h3>
      <p className="lp-demo-desc">
        {t.landingPage.cryptoDesc}
      </p>
      
      <div className="lp-demo-interactive">
        <div className="lp-crypto-panel">
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            {/* Sender Bubble */}
            <div className="lp-crypto-bubble" style={{ flex: 1 }}>
              <div className="lp-crypto-bubble-header">
                <span>{t.landingPage.cryptoSender}</span>
                <span className="lp-crypto-key-badge">{t.landingPage.cryptoSenderKey}</span>
              </div>
              {demoState.stage === "plain" ? (
                <input 
                  type="text" 
                  aria-label={t.landingPage.cryptoSender}
                  value={demoState.message} 
                  onChange={(e) => { 
                    const val = e.target.value;
                    setDemoState(prev => ({
                      ...prev,
                      message: val,
                      scrambled: val
                    }));
                  }}
                  style={{ background: "none", border: "none", padding: 0, fontSize: "0.85rem", color: "#ffffff", width: "100%" }}
                />
              ) : (
                <div className="lp-crypto-text">{demoState.message}</div>
              )}
            </div>

            {/* Recipient Bubble */}
            <div className="lp-crypto-bubble" style={{ flex: 1 }}>
              <div className="lp-crypto-bubble-header">
                <span>{t.landingPage.cryptoRecipient}</span>
                <span className="lp-crypto-key-badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                  {t.landingPage.cryptoRecipientKey}
                </span>
              </div>
              <div className="lp-crypto-text" style={{ color: demoState.stage === "done" ? "#ffffff" : "#71717a" }}>
                {demoState.stage === "plain" && t.landingPage.cryptoWaiting}
                {demoState.stage === "encrypting" && demoState.scrambled}
                {demoState.stage === "cipher" && demoState.scrambled}
                {demoState.stage === "transmitting" && demoState.scrambled}
                {demoState.stage === "decrypting" && demoState.scrambled}
                {demoState.stage === "done" && demoState.scrambled}
              </div>
            </div>
          </div>

          {/* Dotted Sync Pipeline */}
          <div className="lp-crypto-pipeline">
            <div className="lp-crypto-pipeline-line" />
            {demoState.stage !== "plain" && (
              <div className={`lp-crypto-pipeline-dot ${demoState.stage === "transmitting" ? "animating" : ""}`} />
            )}
            <span className="lp-crypto-pipeline-label">
              {demoState.stage === "plain" && t.landingPage.cryptoStagePlain}
              {demoState.stage === "encrypting" && t.landingPage.cryptoStageEncrypting}
              {demoState.stage === "cipher" && t.landingPage.cryptoStageCipher}
              {demoState.stage === "transmitting" && t.landingPage.cryptoStageTransmitting}
              {demoState.stage === "decrypting" && t.landingPage.cryptoStageDecrypting}
              {demoState.stage === "done" && t.landingPage.cryptoStageDone}
            </span>
          </div>

          <div className="lp-crypto-actions">
            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={startCryptoProcess}
              disabled={demoState.stage !== "plain" && demoState.stage !== "done"}
            >
              🔐 {t.landingPage.cryptoSend}
            </button>
            <button 
              type="button"
              className="btn btn-secondary btn-sm" 
              onClick={handleResetCrypto}
            >
              {t.landingPage.cryptoClear}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
