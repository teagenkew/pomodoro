"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  PictureInPicture,
  PictureInPicture2,
} from "lucide-react";

export default function Countdown() {
  const [duration, setDuration] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [breakDuration, setBreakDuration] = useState<number>(0);
  const [alarm, setAlarm] = useState<HTMLAudioElement | null>(null);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [isPopOut, setIsPopOut] = useState(false);

  const popoutWindowRef = useRef<Window | null>(null);

  const handleStart = (): void => {
    if (timeLeft > 0) {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handleButtonClick = (buttonId: number) => {
    setSelectedButton((prevSelected) =>
      prevSelected === buttonId ? null : buttonId
    );
  };

  const handlePause = (): void => {
    if (isActive) {
      setIsPaused(true);
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleReset = (): void => {
    setIsBreak(false);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(typeof duration === "number" ? duration * 60 : 0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleSetDuration = (duration: number): void => {
    setTimeLeft(duration * 60);
    setIsActive(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const togglePopout = async () => {
    if (!isPopOut) {
      try {
        const popoutWindow = window.open(
          "",
          "PomodoroTimer",
          "width=250, height=175, popup = yes"
        );

        if (popoutWindow) {
          popoutWindowRef.current = popoutWindow;
          setIsPopOut(true);

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
        }
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
  useEffect(() => {
    setAlarm(new Audio("/sounds/chime.mp3"));
  }, []);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (alarm) {
              alarm.play();
            }
            if (isBreak === false) {
              // Set break time and continue timer
              setIsBreak(true);
              setTimeLeft(breakDuration * 60);
              return breakDuration * 60;
            } else {
              // Set focus time and continue timer
              setIsBreak(false);
              setTimeLeft(duration * 60);
              return duration * 60;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isPaused, duration, breakDuration, isBreak]);

  useEffect(() => {
    if (popoutWindowRef.current) {
      const timerElement =
        popoutWindowRef.current.document.getElementById("timer");
      const statusElement =
        popoutWindowRef.current.document.getElementById("status");

      if (timerElement && statusElement) {
        timerElement.textContent = formatTime(timeLeft);
        statusElement.textContent = isPaused
          ? "paused"
          : isActive
          ? isBreak
            ? "break"
            : "focus"
          : "ready";
      }
    }
  }, [timeLeft, isPaused, isActive, isBreak]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="flex flex-col  items-center justify-start h-screen bg-gradient-to-l from-stone-100 via-orange-200 to-stone-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 my-52 w-full max-w-md">
        {isActive ? (
          ""
        ) : (
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 text-center">
            {" "}
            Hey Teagen, let's get going!{" "}
          </h1>
        )}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            onClick={() => {
              handleSetDuration(25),
                setDuration(25),
                setBreakDuration(5),
                handleButtonClick(1);
            }}
            className={`${
              selectedButton === 1
                ? "bg-indigo-200 text-indigo-800 font-bold border-2 border-solid border-indigo-600"
                : " bg-indigo-600 "
            } font-bold hover:bg-indigo-900 dark:text-gray-200 hover:text-indigo-200 }`}
          >
            25:5
          </Button>
          <Button
            onClick={() => {
              handleSetDuration(30),
                setDuration(30),
                setBreakDuration(10),
                handleButtonClick(2);
            }}
            className={`${
              selectedButton === 2
                ? "bg-indigo-200 text-indigo-800 font-bold border-2 border-solid border-indigo-600"
                : " bg-indigo-600 "
            } font-bold hover:bg-indigo-900 dark:text-gray-200 hover:text-indigo-200 }`}
          >
            30:10
          </Button>
          <Button
            onClick={() => {
              handleSetDuration(45),
                setDuration(45),
                setBreakDuration(15),
                handleButtonClick(3);
            }}
            className={`${
              selectedButton === 3
                ? "bg-indigo-200 text-indigo-800 font-bold border-2 border-solid border-indigo-600"
                : " bg-indigo-600 "
            } font-bold hover:bg-indigo-900 dark:text-gray-200 hover:text-indigo-200 }`}
          >
            45:15
          </Button>
        </div>
        <h2 className="text-lg mb-2 text-center text-amber-600 font-semibold italic">
          {isPaused
            ? "paused"
            : isActive
            ? isBreak
              ? "break"
              : "focus"
            : "What kind of pomodoro are we doing?"}
        </h2>

        <div className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
          {formatTime(timeLeft)}
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleStart}
            variant="outline"
            className="text-gray-800 dark:text-gray-200"
          >
            <Play />
          </Button>
          <Button
            onClick={handlePause}
            variant="outline"
            className="text-gray-800 dark:text-gray-200"
          >
            <Pause />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="text-gray-800 dark:text-gray-200"
          >
            <RotateCcw />
          </Button>
          <Button
            onClick={togglePopout}
            variant="outline"
            className="text-gray-800 dark:text-gray-200"
          >
            {isPopOut ? <PictureInPicture /> : <PictureInPicture2 size={24} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
