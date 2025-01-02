"use client";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function Countdown() {

    const [duration, setDuration] = useState<number | string>("")
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [breakDuration, setBreakDuration] = useState<number>(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const alarm = new Audio("/sounds/chime.mp3"
    );
    const handleSetDuration = (duration: number): void => {
        setTimeLeft(duration * 60);
        setIsActive(false);
        setIsPaused(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }

    const handleStart = (): void => {
        if (timeLeft > 0) {
            setIsActive(true);
            setIsPaused(false);
        }
    }

    const handlePause = (): void => {
        if (isActive) {
            setIsPaused(true);
            setIsActive(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    }

    const handleReset = (): void => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(typeof duration === "number" ? duration : 0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }

    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current!);
                        alarm.play();
                        setTimeLeft(breakDuration * 60);
                    }
                    return prevTime - 1;
                })
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    }, [isActive, isPaused])

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }

    const handleDurationChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setDuration(Number(e.target.value) || "");
    }

    return (
        <div className="flex flex-col  items-center justify-start h-screen bg-gradient-to-l from-stone-100 via-orange-200 to-stone-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 my-52 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 text-center"> Hey Teagen, let's get going! </h1>
                <h2 className="text-md mb-6 text-center"> What kind of pomodoro are we doing? </h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Button onClick={()=>{handleSetDuration(25), setBreakDuration(5)}} className="text-gray-200 dark:text-gray-200 bg-indigo-600 hover:bg-amber-300  hover:text-gray-800 font-bold">25:5</Button>
                    <Button onClick={()=>{handleSetDuration(30), setBreakDuration(10)}} className="text-gray-200 dark:text-gray-200 bg-indigo-600 hover:bg-amber-300  hover:text-gray-800 font-bold">30:10</Button>
                    <Button onClick={()=>{handleSetDuration(45), setBreakDuration(15)}} className="text-gray-200 dark:text-gray-200 bg-indigo-600 hover:bg-amber-300  hover:text-gray-800 font-bold">45:15</Button>
                </div>
                <div className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
                    {formatTime(timeLeft)}
                </div>
                <div className="flex justify-center gap-4">
                    <Button onClick={handleStart}
                        variant="outline"
                        className="text-gray-800 dark:text-gray-200">{isPaused ? "Resume" : "Start"}
                    </Button>
                    <Button onClick={handlePause}
                        variant="outline"
                        className="text-gray-800 dark:text-gray-200">
                        Pause
                    </Button>
                    <Button onClick={handleReset}
                        variant="outline"
                        className="text-gray-800 dark:text-gray-200">
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    )
}
