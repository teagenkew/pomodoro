import Countdown from "@/components/count-down";
import Head from "next/head";
export default function Home() {
  return (
    <>
      <div>
        <Head>
          <title>Pomodoro</title>
        </Head>
      </div>
      <div>
        <Countdown />
      </div>
    </>
  );
}
