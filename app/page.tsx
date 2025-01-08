export const metadata = {
  title: "Pomodoro",
  icons: {
    icon: "/bird.png",
    apple: "/bird.png",
  },
};
import Countdown from "@/app/components/count-down";
export default function Home() {
  return (
    <div>
      <Countdown />
    </div>
  );
}
