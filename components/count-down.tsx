"use client";
import {useState, useRef, useEffect, ChangeEvent} from "react";
import { Input } from "@/components/ui/input";  
import { Button } from "@/components/ui/button";
export default function Countdown() {

    const [duration, setDuration] = useState<number | string>("")
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const alarm = new Audio("/sounds/chime.mp3"
    );
    const handleSetDuration = (): void => {
        if (typeof duration === "number" && duration > 0) {
            setTimeLeft(duration * 60);
            setIsActive(false);
            setIsPaused(false);
            if (timerRef.current){
                clearInterval(timerRef.current);
            }
        }
    }
    
    const handleStart = (): void => {
        if (timeLeft > 0) {
            setIsActive(true);
            setIsPaused(false);
        }
    }
    
    const handlePause = (): void => {
        if (isActive){
            setIsPaused(true);
            setIsActive(false);
            if (timerRef.current){
                clearInterval(timerRef.current);
            }
        }
    }
    
    const handleReset = ():void => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(typeof duration === "number" ? duration : 0);
        if (timerRef.current){
            clearInterval(timerRef.current);
        }
    }
    
    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <=1) {
                        clearInterval(timerRef.current!);
                        alarm.play();
                        return 0;
                    }
                    return prevTime-1;
                })
            }, 1000);
        }
        return () => {
            if (timerRef.current){
                clearInterval(timerRef.current);
            }
        }
    }, [isActive, isPaused]) 
    
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time/60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }
    
    const handleDurationChange = (e: ChangeEvent<HTMLInputElement>):void =>{
        setDuration(Number(e.target.value) || "");
    }
    
    return (
        <div className="flex flex-col  items-center justify-start h-screen bg-gradient-to-l from-gray-200 via-sky-200 to-stone-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 my-52 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 text-center"> Countdown Timer</h1>
            <div className="flex items-centter mb-6">
                <Input type="number"
                id = "duration"
                placeholder="Enter duration in minutes"
                value={duration}
                onChange={handleDurationChange}
                className="flex-1 mr-4 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                </Input>
                <Button onClick={handleSetDuration} variant="outline" className="text-gray-800 dark:text-gray-200">Set</Button>
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
