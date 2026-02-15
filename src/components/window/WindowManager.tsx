import { useWindows } from "@/contexts/WindowContext";
import Window from "./Window";

const WindowManager = () => {
  const { windows } = useWindows();
  return (
    <>
      {windows.map((win) => (
        <Window key={win.id} win={win} />
      ))}
    </>
  );
};

export default WindowManager;
