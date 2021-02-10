import React, { useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

interface IProps {
  setImage: (file: Blob) => void;
  imagePreview: string;
}

const PhotoWidgetCropper: React.FC<IProps> = ({ setImage, imagePreview }) => {
  const cropperRef = useRef<any>(null);
  const onCrop = () => {
    if (
      cropperRef.current &&
      typeof cropperRef.current.getCroppedCanvas() === "undefined"
    ) {
      return;
    }
    cropperRef &&
      cropperRef.current &&
      cropperRef.current.getCroppedCanvas().toBlob((blob: any) => {
        setImage(blob);
      }, "image/jpeg");
  };

  return (
    <Cropper
      src={imagePreview}
      style={{ height: 200, width: "100%" }}
      // Cropper.js options

      aspectRatio={1 / 1}
      preview=".img-preview"
      guides={false}
      crop={onCrop}
      viewMode={1}
      dragMode="move"
      scalable={true}
      cropBoxMovable={true}
      cropBoxResizable={true}
      ref={cropperRef}
    />
  );
};

export default PhotoWidgetCropper;
