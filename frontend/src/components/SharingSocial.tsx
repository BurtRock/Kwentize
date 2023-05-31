import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedinIn,
  faTelegram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCircleNotch,
  faLink,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { NFTStorage } from "nft.storage";

const SharingSocial: React.FC = () => {
  const [loading, setLoading] = useState("");
  const [copied, setCopied] = useState(false);

  const upload = async () => {
    return new Promise(async (res, rej) => {
      if (!loading) {
        try {
          const imgEl: any = document.getElementById("previewImageElement");
          const img = new Image();
          img.src = imgEl.src;
          const canvas = document.createElement("canvas");
          const ctx: any = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          console.log("Uploading on IPFS final rendering...");
          const NFT_STORAGE_TOKEN = import.meta.env.VITE_NFT_STORAGE_KEY;
          const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
          canvas.toBlob(async (blob: any) => {
            const png = new File(
              [blob],
              "kwentize_avatar" + new Date().getTime().toString() + ".png",
              { type: "image/png" }
            );
            const cid = await client.storeBlob(png);
            if (cid !== undefined) {
              window.localStorage.setItem("img_url", cid);
              res(cid);
            }
          }, "image/jpeg");
        } catch {
          rej(null);
        }
      } else {
        rej(null);
      }
    });
  };
  const shareOnSocial = async (social: any) => {
    if (!loading) {
      setLoading(social);
      let image: any = window.localStorage.getItem("img_url");
      if (!image) {
        image = await upload();
      }
      if (image) {
        const REMOVEBG_URL = import.meta.env.VITE_REMOVEBG_URL;
        let url: string = "";
        if (social === "tw") {
          url = `https://twitter.com/intent/tweet?url=${REMOVEBG_URL}/share/${image}`;
        } else if (social === "li") {
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${REMOVEBG_URL}/share/${image}`;
        } else if (social === "tg") {
          url = `https://t.me/share/url?url=${REMOVEBG_URL}/share/${image}&text=`;
        } else if (social === "link") {
          url = "https://" + image + ".ipfs.nftstorage.link"
          navigator.clipboard
            .writeText(url)
            .then(() => {
              setLoading("");
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            })
            .catch((e) => {
              setLoading("");
              console.log(e);
            });
        }
        if (social !== "link") {
          let a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          setLoading("");
          a.click();
          a.remove();
        }
      } else {
        setLoading("");
      }
    }
  };

  return (
    <>
      <div className="mt-3 color-tertiary">
        <p className="color-tertiary">Share on Social</p>
        <div className="mt-2">
          <FontAwesomeIcon
            icon={
              loading === "link" ? faCircleNotch : copied ? faCheck : faLink
            }
            className={loading === "link" ? "rotate-center me-3" : "me-3"}
            style={{ cursor: "pointer" }}
            onClick={() => {
              shareOnSocial("link");
            }}
          ></FontAwesomeIcon>
          <FontAwesomeIcon
            icon={loading === "tw" ? faCircleNotch : faTwitter}
            className={loading === "tw" ? "rotate-center me-3" : "me-3"}
            style={{ cursor: "pointer" }}
            onClick={() => {
              shareOnSocial("tw");
            }}
          ></FontAwesomeIcon>
          <FontAwesomeIcon
            icon={loading === "tg" ? faCircleNotch : faTelegram}
            className={loading === "tg" ? "rotate-center me-3" : "me-3"}
            style={{ cursor: "pointer" }}
            onClick={() => {
              shareOnSocial("tg");
            }}
          ></FontAwesomeIcon>
          <FontAwesomeIcon
            icon={loading === "li" ? faCircleNotch : faLinkedinIn}
            className={loading === "li" ? "rotate-center" : ""}
            style={{ cursor: "pointer" }}
            onClick={() => {
              shareOnSocial("li");
            }}
          ></FontAwesomeIcon>
        </div>
      </div>
    </>
  );
};

export default SharingSocial;
