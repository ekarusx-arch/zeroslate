import { useState, useEffect } from "react";

export function useCurrentMinutes() {
  const [currentMinutes, setCurrentMinutes] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };

    update();
    const intervalId = setInterval(update, 30000); // 30초마다 업데이트

    return () => clearInterval(intervalId);
  }, []);

  return currentMinutes;
}
