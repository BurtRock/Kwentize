import React, { useContext, useState, useRef, useEffect } from "react";
import { ViewportContext } from "../context/ViewportContext";
import { NFTStorage } from "nft.storage";
import axios from "axios";

// COMPONENTS
import SharingSocial from "./SharingSocial";

//BOOTSTRAP ELEMENTS
import { Col, Container, FormLabel, Row } from "react-bootstrap";
import FormRange from "react-bootstrap/esm/FormRange";

// ICONS
import addIcon from "../components/icons/addIcon.svg";
import spinner from "../components/icons/spinnerIcon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faGear, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

declare global {
  interface Window {
    bodyPix: any;
  }
}

window.bodyPix = window.bodyPix || {};

const AvatarUploaderNEW: React.FC = () => {
  // RESPONSIVE LOGIC AND CLASSES
  const { isDesktop, isMobile } = useContext(ViewportContext)!;
  const marginCol = isDesktop ? "py-4 px-4" : "py-4 px-4";
  const marginBottom = isDesktop ? "" : "mb-2";

  // STATES
  const [isDragging, setIsDragging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);

  //FILE UPLOADED
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PREVIEW IMAGE AFTER UPLOAD - CHANGED SIZE AND POSITION
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [size, setSize] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [positionX, setPositionX] = useState<number>(0);
  // deleting prev uploaded image url
  window.localStorage.removeItem("img_url");

  const [urlUploadedImg, setUrlUploadedImg] = useState("");
  const [showSettings, setShowSettings] = useState(false)
  const [removeBgMethod, setRemoveBgMethod] = useState("v1")
  const [modalError, setModalError] = useState("")

  const removeBackgroundImage = async (image_src: string, method: any = null): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const img = new Image();
        img.src = image_src;
        img.setAttribute("crossorigin", "anonymous")

        const canvas = document.createElement("canvas");
        const ctx: any = canvas.getContext("2d");

        img.addEventListener("load", async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const calculatedProportion = img.width / img.height;
          console.log("Calculated proportion is:", calculatedProportion);
          window.localStorage.setItem(
            "proportion",
            calculatedProportion.toString()
          );
          ctx.drawImage(img, 0, 0);
          let image_url: any = ""
          let method_ = (method) ?? removeBgMethod
          if (method_ === 'v1') {
            console.log("calling v1")
            image_url = await backgroundRemoval(canvas)
          } else if (method_ === 'v2') {
            console.log("calling v2")
            image_url = await backgroundRemoval2()
          }
          if (image_url.length > 0) {
            canvas.remove();
            console.log("Setting cleaned image:", image_url);
            window.localStorage.setItem("cleanedImage", image_url);
            setTimeout(function () {
              renderAvatar();
              resolve(image_url);
            }, 500);
          } else {
            reject("IPFS_ERROR");
          }
        });
      } catch {
        reject("");
      }
    });
  };

  const changeBackgroundRemovalMethod = async () => {
    if (!isLoading) {
      setIsLoading(true);
      let method = (removeBgMethod === 'v1') ? 'v2' : 'v1'
      setRemoveBgMethod(method)
      await removeBackgroundImage(urlUploadedImg, method)
      setIsLoading(false);
    }
  }

  const backgroundRemoval = (canvas: any) => {
    return new Promise(async (response) => {
      const NFT_STORAGE_TOKEN = import.meta.env.VITE_NFT_STORAGE_KEY;
      const REMOVEBG_URL = import.meta.env.VITE_REMOVEBG_URL;
      try {
        console.log("Uploading on IPFS original image..");
        const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
        canvas.toBlob(async (blob: any) => {
          const cid = await client.storeBlob(blob);
          if (cid !== undefined) {
            let urlUploadedImg = "https://" + cid + ".ipfs.nftstorage.link"
            setUrlUploadedImg(urlUploadedImg)
            console.log("Removing background..");
            const removed = await axios.post(REMOVEBG_URL + "/remove", {
              url: urlUploadedImg,
            });
            if (removed.data.result !== undefined) {
              console.log("Background removed!");
              response(REMOVEBG_URL + "/static/" + removed.data.result);
            } else {
              console.log("Background errored..");
              response("");
            }
          } else {
            response("");
          }
        }, "image/jpeg");
      } catch (e) {
        response("");
      }
    });
  };

  const backgroundRemoval2 = () => {
    // Can be called after v1
    return new Promise(async (response) => {
      if (urlUploadedImg) {
        const REMOVEBG_URL = import.meta.env.VITE_REMOVEBG_URL;
        try {
          console.log("Removing background..");
          const removed = await axios.post(REMOVEBG_URL + "/remove-bg-2", {
            url: urlUploadedImg,
          });
          if (removed.data.result !== undefined) {
            console.log("Background removed!");
            response(REMOVEBG_URL + "/static/" + removed.data.result);
          } else {
            console.log("Background errored..");
            response("");
          }
        } catch (e: any) {
          if (e?.request) {
            setModalError("You have exceeded the limit of daily free requests")
          }
          response("");
        }
      }
    });
  };

  // ACTUAL RENDERING
  const renderAvatar = () => {
    if (!isRendering) {
      setIsRendering(true);
      const previewCanvas = document.createElement("canvas");
      let width = 960;
      let height = 960;
      previewCanvas.width = width;
      previewCanvas.height = height;
      const cleanedImage = window.localStorage.getItem("cleanedImage");
      if (previewCanvas !== null && cleanedImage !== null) {
        let previewCtx: any = previewCanvas.getContext("2d");
        // ADD BACKGROUND
        let top = new Image();
        top.src = "/top.png";
        top.setAttribute("crossorigin", "anonymous");
        top.onload = () => {
          previewCtx.drawImage(top, 0, 0, width, height);
          // ADD AVATAR
          let avatar = new Image();
          avatar.src = cleanedImage;
          avatar.setAttribute("crossorigin", "anonymous");
          avatar.onload = () => {
            const proportion = window.localStorage.getItem("proportion");
            if (proportion !== null) {
              console.log("Image proportion is:", proportion);
              let finalWidth = (width / 100) * size + width;
              let finalHeight =
                ((height / 100) * size + height) / parseFloat(proportion);
              let px = (previewCanvas.width - finalWidth) / 2;
              let py = (previewCanvas.height - finalHeight) / 2;
              let finalX =
                previewCanvas.width / 2 +
                (px - previewCanvas.width / 2 + positionX);
              let finalY =
                previewCanvas.height / 2 +
                (py - previewCanvas.height / 2 + positionY);
              previewCtx.drawImage(
                avatar,
                finalX,
                finalY,
                finalWidth,
                finalHeight
              );
              let bottom = new Image();
              bottom.src = "/bottom.png";
              bottom.setAttribute("crossorigin", "anonymous");
              bottom.onload = () => {
                previewCtx.drawImage(bottom, 0, 0, width, height);
                var url = previewCanvas.toDataURL("image/png");
                setPreviewImage(url);
                setIsRendering(false);
              };
            }
          };
        };
      } else {
        setIsRendering(false);
      }
    }
  };

  // FILE INPUT BY BUTTON
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    window.localStorage.removeItem("img_url");
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file);
    setIsLoading(true);
    if (file) {
      const imageURL = URL.createObjectURL(file);
      await removeBackgroundImage(imageURL);
      setIsLoading(false);
    }
  };

  const handleZoomChange = (value: number) => {
    window.localStorage.removeItem("img_url");
    setSize(value);
    renderAvatar();
  };

  const handlePositionXChange = (value: number) => {
    window.localStorage.removeItem("img_url");
    setPositionX(value);
    renderAvatar();
  };

  const handlePositionYChange = (value: number) => {
    window.localStorage.removeItem("img_url");
    setPositionY(value);
    renderAvatar();
  };

  // DRAG OVER/LEAVE/ENTER
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    window.localStorage.removeItem("img_url");
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    window.localStorage.removeItem("img_url");
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const containerImg = document.querySelector(".dragging");

    if (containerImg && !containerImg.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  // RESET INPUT FILE
  const handleButtonClick = () => {
    window.localStorage.removeItem("img_url");
    setSelectedFile(null);
    setPositionX(0);
    setPositionY(0);
    setSize(0);
    handleZoomChange(0);
    handlePositionXChange(0);
    handlePositionYChange(0);
    setUrlUploadedImg("");
    setShowSettings(false);
    setRemoveBgMethod("v1");
    console.log("reset");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 100);
    }
  };

  const openSettings = () => {
    setShowSettings(!showSettings)
  }

  // DROP FILE
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    window.localStorage.removeItem("img_url");
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
    setIsLoading(true);
    setIsDragging(false);
    const imageURL = URL.createObjectURL(file);
    await removeBackgroundImage(imageURL);
    setIsLoading(false);
  };

  // LOADER FILE INPUT
  const handleDragLoader = (event: React.DragEvent<HTMLDivElement>) => {
    window.localStorage.removeItem("img_url");
    event.preventDefault();
    setIsDragging(true);
  };

  // DOWNLOAD IMAGE
  const handleDownload = async () => {
    setIsGeneratingDownload(true);
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
        setIsGeneratingDownload(false);
        let a = document.createElement("a");
        a.href = window.URL.createObjectURL(png);
        a.download =
          "Kwentize download " +
          new Date()?.toLocaleDateString()?.split("/")?.join("-") +
          ".png";
        a.click();
        a.remove();
      } else {
        handleDownload();
      }
    }, "image/jpeg");
  };

  useEffect(() => {
    if (selectedFile) {
      setIsLoading(true);
    }
  }, [selectedFile]);

  return (
    <>
      <div
        className="fade-in-fwd"
        style={{ position: "relative", zIndex: "10" }}
      >
        {isMobile && <div className="gap-header"></div>}
        <Container>
          {modalError &&
            <div className={'error_modal text-center'}>
              <FontAwesomeIcon
                onClick={() => { setModalError(""); handleButtonClick() }}
                icon={faCircleXmark}
                className="color-secondary cursor-pointer"
              ></FontAwesomeIcon>
              <FontAwesomeIcon
                onClick={openSettings}
                icon={faExclamationTriangle}
                className="color-secondary cursor-pointer"
              ></FontAwesomeIcon>
              <p>{modalError}</p>
            </div>
          }
          <Row className="justify-content-center">
            <Col
              xs="11"
              sm="8"
              md="8"
              lg="5"
              className={` ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`${marginCol} card-custom text-center`}>
                <h1 className="color-secondary">Welcome to Kwentize</h1>

                <p className="mt-2">
                  Build your custom avatar in a few simple clicks.
                </p>
                <div
                  style={{ position: "relative" }}
                  className={` mx-auto my-5 ${isDragging ? "dragging-area" : "container-img"
                    }`}
                  onDragEnter={handleDragLoader}
                >
                  {selectedFile && !isDragging ? (
                    isLoading ? (
                      <div className="dragging-area">
                        <div className="dragging-area-content rotate-center">
                          <img src={spinner} alt="" />
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex align-items-start preview-image-container">
                        {previewImage && (
                          <div className="preview-image-borders"></div>
                        )}
                        <img
                          src={previewImage || ""}
                          alt=""
                          id="previewImageElement"
                        />
                        {urlUploadedImg &&
                          <FontAwesomeIcon
                            onClick={openSettings}
                            icon={faGear}
                            className="color-secondary cursor-pointer"
                          ></FontAwesomeIcon>
                        }
                        {showSettings &&
                          <div className="settings_container">
                            <button
                              className="btn-primary mx-auto"
                              onClick={handleButtonClick}
                            >
                              <span>Reset</span>
                            </button>
                            <div className="d-flex flex-column">
                              <p className="mb-2 mt-4">Method</p>
                              <div className="method_switch" onClick={changeBackgroundRemovalMethod}>
                                <div className={(removeBgMethod === 'v2') ? 'right' : ''}></div>
                              </div>
                              <div className="d-flex flex-row px-md-1 justify-content-between mt-2">
                                <p className={(removeBgMethod === 'v1') ? 'fw-bold' : ''}>Internal</p>
                                <p className={(removeBgMethod === 'v2') ? 'fw-bold' : ''}>RemoveBG</p>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    )
                  ) : (
                    <div className="dragging-area">
                      <div className="dragging-area-content">
                        <img src={addIcon} alt="" />
                      </div>
                    </div>
                  )}

                  {!selectedFile && (
                    <input
                      className="hiddenInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  )}
                </div>

                <div className="px-5">
                  <Row>
                    <Col xs="2" sm="2" md="2" lg="2" className="text-start">
                      <div>
                        <FormLabel className="mb-0">Z</FormLabel>
                      </div>
                      <div>
                        <FormLabel
                          style={{ marginTop: "6px", marginBottom: "6px" }}
                        >
                          X
                        </FormLabel>
                      </div>
                      <div>
                        <FormLabel className="mb-0">Y</FormLabel>
                      </div>
                    </Col>
                    <Col xs="8" sm="8" md="8" lg="8">
                      <FormRange
                        value={size.toString()}
                        min={-100}
                        max={100}
                        step={1}
                        onChange={(event) =>
                          handleZoomChange(Number(event.target.value))
                        }
                      />

                      <FormRange
                        value={positionX.toString()}
                        min={-100}
                        max={100}
                        step={1}
                        onChange={(event) =>
                          handlePositionXChange(Number(event.target.value))
                        }
                      />

                      <FormRange
                        value={positionY.toString()}
                        min={-300}
                        max={300}
                        step={1}
                        onChange={(event) =>
                          handlePositionYChange(Number(event.target.value))
                        }
                      />
                    </Col>
                    <Col xs="2" sm="2" md="2" lg="2" className="text-end">
                      <div>
                        <FormLabel className="color-tertiary mb-0">
                          {!isNaN(size) ? parseInt(size.toString()) : ""}%
                        </FormLabel>
                      </div>

                      <div>
                        <FormLabel
                          className="color-tertiary"
                          style={{ marginTop: "6px", marginBottom: "6px" }}
                        >
                          {!isNaN(positionX)
                            ? parseInt(positionX.toString())
                            : ""}
                          %
                        </FormLabel>
                      </div>
                      <div>
                        <FormLabel className="color-tertiary mb-0">
                          {!isNaN(positionY)
                            ? parseInt(positionY.toString())
                            : ""}
                          %
                        </FormLabel>
                      </div>
                    </Col>
                  </Row>
                </div>

                {selectedFile && !isLoading ? (
                  <>
                    {!isGeneratingDownload && (
                      <>
                        <button
                          className="btn-primary mx-auto mt-4"
                          style={{ width: "190px" }}
                          onClick={handleDownload}
                        >
                          <span>Download</span>
                        </button>
                      </>
                    )}
                    {isGeneratingDownload && (
                      <>
                        <button
                          className="btn-primary mx-auto mt-4"
                          style={{ width: "200px" }}
                        >
                          <span>Generating link...</span>
                        </button>
                      </>
                    )}
                    <SharingSocial />
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleButtonClick}
                      className={`${marginBottom} btn-primary mx-auto mt-4`}
                      style={{ width: "190px" }}
                    >
                      <span>Upload photo</span>
                    </button>
                    {isDesktop && (
                      <p className="mt-2 color-contrast">
                        or drag your photo here
                      </p>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AvatarUploaderNEW;
