import { useContext } from "react";
import { ViewportContext } from "../context/ViewportContext";

import logo from "../assets/logo.svg";
const Header = () => {
  const { isMobile } = useContext(ViewportContext)!;
  const centerHeader = isMobile
    ? "justify-content-center"
    : "justify-content-between";

  return (
    <>
      <div className={`${centerHeader} header d-flex align-items-center px-5`}>
        <div className="nav-brand">
          <img src={logo} alt="" />
        </div>
      </div>
    </>
  );
};

export default Header;
