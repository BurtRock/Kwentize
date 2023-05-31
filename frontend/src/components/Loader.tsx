import { useState, useEffect } from "react";
import Visual from "../assets/visualLogo.svg";
import Copy from "../assets/copyLogo.svg";

const Loader = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000);
    setTimeout(() => {
      const loader = document.getElementById("loader");
      loader?.classList.add("fade-out");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
    return (
      <div className="loader" id="loader">
        <div className="d-flex flex-column align-items-center loader-content">
          <div className="visual mb-5">
            <img className="neon-svg" src={Visual} alt="" />
          </div>
          <div className="copy">
            <img src={Copy} alt="" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Loader;
