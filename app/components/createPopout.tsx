import { RefObject } from "react";

interface PopUpTimerProps {
  timeLeft: number;
  isPaused: boolean;
  isActive: boolean;
  isBreak: boolean;
  setIsPaused: (value: boolean) => void;
  setIsActive: (value: boolean) => void;
  setIsPopOut: (value: boolean) => void;
  timerRef: RefObject<NodeJS.Timeout | null>;
  popoutWindowRef: RefObject<Window | null>;
}

export const togglePopout = async ({
  timeLeft,
  isPaused,
  isActive,
  isBreak,
  setIsPaused,
  setIsActive,
  setIsPopOut,
  timerRef,
  popoutWindowRef,
}: PopUpTimerProps): Promise<void> => {
  const isCurrentlyPopped = Boolean(popoutWindowRef.current);
  if (!isCurrentlyPopped) {
    try {
      const popoutWindow = window.open(
        "",
        "PomodoroTimer",
        "width=250, height=175, popup = yes"
      );
      if (!popoutWindow) {
        console.error("Failed to create popup window");
        return;
      } else {
        popoutWindowRef.current = popoutWindow;
        setIsPopOut(true);
      }

      const doc = popoutWindow.document;
      doc.title = "Pomodoro Timer";

      const style = doc.createElement("style");
      style.textContent = `body {
              margin: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              background: rgb(165,180,252);
              background: radial-gradient(circle, rgba(165,180,252,1) 50%, rgba(55,48,163,1) 100%);
            }
            .timer {
              font-size: 48px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 1rem;
            }
            .status {
              font-size: 24px;
              color: rgb(194 65 12);
              font-style: italic;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .button {
              padding: 0.25rem 0.5rem;
              font-size: 12px;
              font-weight: bold;
              color: white;
              background-color: rgb(55 48 163);
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
          .button:hover {
            background-color: #0369a1;
          }
          
          .button-container{
            display:flex;
            gap:1rem;

          }`;
      doc.head.appendChild(style);

      // Add HTML content
      const statusDiv = doc.createElement("div");
      statusDiv.className = "status";
      statusDiv.id = "status";
      doc.body.appendChild(statusDiv);

      const timerDiv = doc.createElement("div");
      timerDiv.className = "timer";
      timerDiv.id = "timer";
      doc.body.appendChild(timerDiv);

      const buttonContainer = doc.createElement("div");
      buttonContainer.className = "button-container";

      const pauseButton = doc.createElement("button");
      pauseButton.textContent = "Pause";
      pauseButton.className = "button";
      pauseButton.onclick = () => {
        setIsPaused(true);
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      buttonContainer.appendChild(pauseButton);

      const resumeButton = doc.createElement("button");
      resumeButton.textContent = "Resume";
      resumeButton.className = "button";
      resumeButton.onclick = () => {
        setIsPaused(false);
        setIsActive(true);
      };
      buttonContainer.appendChild(resumeButton);

      doc.body.appendChild(buttonContainer);

      // Handle window close event
      popoutWindow.onbeforeunload = () => {
        setIsPopOut(false);
        popoutWindowRef.current = null;
      };
    } catch (error) {
      console.error("Failed to create popup window", error);
    }
  } else {
    if (popoutWindowRef.current) {
      popoutWindowRef.current.close();
      popoutWindowRef.current = null;
      setIsPopOut(false);
    }
  }
};
