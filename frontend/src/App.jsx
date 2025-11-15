import { useState, useEffect } from "react";
import FigmaLanding from "./figma/FigmaLanding.jsx";
import UserOnboarding, { isProfileComplete } from "./components/UserOnboarding.jsx";

export default function App() {
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Check initial profile status
    setProfileComplete(isProfileComplete());

    // Listen for profile updates
    const handleProfileUpdate = () => {
      setProfileComplete(isProfileComplete());
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  if (!profileComplete) {
    return <UserOnboarding />;
  }

  return <FigmaLanding />;
}
