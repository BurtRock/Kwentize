import React, { useContext } from "react";
import { ViewportContext } from "../context/ViewportContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";

import kwentaLogo from "../assets/kwentaLogo.svg";
import yomiLogo from "../assets/yomiLogo.svg";

const Footer: React.FC = () => {
  const { isDesktop, isMobile } = useContext(ViewportContext)!;
  const elementClassName = isDesktop ? "footer-desktop" : "footer-mobile mt-3";
  const centerFooter = isMobile
    ? "justify-content-center"
    : "justify-content-between";

  return (
    <>
      <div className={`${elementClassName} `}>
        {isMobile && (
          <div className="d-flex justify-content-center align-items-center mb-4">
            <a href="https://twitter.com/kwentagc" target="_blank">
              <FontAwesomeIcon icon={faTwitter} className="me-4" size="lg" />
            </a>
            <a href="https://discord.com/invite/hGTyqQzaBb" target="_blank">
              <FontAwesomeIcon icon={faDiscord} size="lg" />
            </a>
          </div>
        )}
        <div className={`${centerFooter} d-flex align-items-center px-5`}>
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column ">
              <a href="https://kwentagc.eth.limo/" target="_blank">
                <p
                  className="color-primary-high-contrast"
                  style={{ opacity: "0.5" }}
                >
                  POWERED BY
                </p>
                <img className="mt-1" src={kwentaLogo} alt="" />
              </a>
            </div>
            <div className="d-flex flex-column ms-5">
              <a href="https://yomi.digital/#/" target="_blank">
                <p
                  className="color-primary-high-contrast"
                  style={{ opacity: "0.5" }}
                >
                  DEVELOPED BY
                </p>
                <img className="mt-1" src={yomiLogo} alt="" />
              </a>
            </div>
          </div>
          {!isMobile && (
            <div>
              <a href="https://twitter.com/kwentagc" target="_blank">
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="me-4"
                  size="lg"
                  style={{ opacity: "0.5" }}
                />
              </a>
              <a href="https://discord.com/invite/hGTyqQzaBb" target="_blank">
                <FontAwesomeIcon
                  icon={faDiscord}
                  className="me-4"
                  size="lg"
                  style={{ opacity: "0.5" }}
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Footer;
