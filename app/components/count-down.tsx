"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { togglePopout } from "./createPopout";
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
  const [selectedButton, setSelectedButton] = useState<number | null>(0);
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

  const handlePopout = () => {
    togglePopout({
      setIsPaused,
      setIsActive,
      setIsPopOut,
      timerRef,
      popoutWindowRef,
    });
  };

  useEffect(() => {
    setAlarm(new Audio("/sounds/chime.mp3"));
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    let lastTime: number = Date.now();

    const updateTimer = () => {
      if (isActive && !isPaused) {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        setTimeLeft((prevTime) => {
          const newTime = Math.max(0, prevTime - deltaTime);

          if (newTime <= 0) {
            if (alarm) {
              alarm.play();
            }
            if (!isBreak) {
              setIsBreak(true);
              return breakDuration * 60;
            } else {
              setIsBreak(false);
              return duration * 60;
            }
          }
          return newTime;
        });

        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    if (isActive && !isPaused) {
      lastTime = Date.now();
      animationFrameId = requestAnimationFrame(updateTimer);
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
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
  }, [timeLeft, isPaused, isActive, isBreak, alarm]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    // Pad with zeros if needed
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getButtonClasses = (buttonId: number) =>
    `font-bold ${
      selectedButton === buttonId
        ? "bg-indigo-200 text-indigo-800 border-2 border-amber-400 dark:bg-indigo-500 dark:text-indigo-300"
        : "bg-indigo-700 text-gray-100 hover:bg-indigo-500 hover:text-indigo-200 dark:bg-indigo-800 dark:text-gray-400"
    }`;

  return (
    <div className="flex flex-col  items-center justify-start h-screen bg-gradient-to-l from-stone-100 via-orange-200 to-stone-100 dark:from-stone-900 dark:via-yellow-950 dark:to-stone-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 my-52 w-full max-w-md">
        {isActive ? (
          ""
        ) : (
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 text-center">
            {" "}
            Hey Teagen, let&apos;s get going!{" "}
          </h1>
        )}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            onClick={() => {
              handleSetDuration(25);
              setDuration(25);
              setBreakDuration(5);
              handleButtonClick(1);
            }}
            className={getButtonClasses(1)}
          >
            25:5
          </Button>
          <Button
            onClick={() => {
              handleSetDuration(30);
              setDuration(30);
              setBreakDuration(10);
              handleButtonClick(2);
            }}
            className={getButtonClasses(2)}
          >
            30:10
          </Button>
          <Button
            onClick={() => {
              handleSetDuration(45);
              setDuration(45);
              setBreakDuration(15);
              handleButtonClick(3);
            }}
            className={getButtonClasses(3)}
          >
            45:15
          </Button>
        </div>
        <h2 className="text-lg mb-2 text-center text-amber-600 dark:text-blue-300 italic">
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
            onClick={handlePopout}
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
