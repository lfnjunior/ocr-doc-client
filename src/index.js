import React, { useState, useCallback, useEffect,  } from "react";
import ReactDOM from "react-dom";
import Cropper from "react-easy-crop";
import Slider from "@material-ui/lab/Slider";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import { getOrientation } from "get-orientation/browser";
import { getCroppedImg, getRotatedImage } from "./canvasUtils";
import { styles } from "./styles";
import axios from 'axios';

const ORIENTATION_TO_ANGLE = {
  "3": 180,
  "6": 90,
  "8": -90
};

const Demo = ({ classes }) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [maxWidth, setMaxWidth] = useState(null);
  const [maxHeight, setMaxHeight] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0});
  const [cropSize, setCropSize] = useState({ width, height });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState('');
  const [text, setText] = useState('');

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      console.log(cropped)
      setCroppedImage(cropped)
            
      let config = {
        header : {
          'Content-Type' : 'multipart/form-data'
        }
      }

      const data = new FormData()
    
      data.append('image', cropped)

      axios.post('http://localhost:5000/upload', data, config).then( 
        (res) => { 
          setText(res.data.message)
        },
        (error) => { 
          console.log(error)
        }
      );

    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, rotation]);


  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file)
      let imageDataUrl = await readFile(file);

      
      //var image = images.item(0); 
      //console.log(image); 


      //console.log(`teste`, imageTest.attributes.height, imageTest.attributes.width  );

      // var image = new Image();
      // image.src = window.URL.createObjectURL( file );
      // image.onload = function() {
      //   setMaxHeight(this.height);
      //   setMaxWidth(this.width);
      //   console.log(`largura:  ${this.width} - altura: ${this.height}`);
      //   return true;
      // };

      // apply rotation if needed
      const orientation = await getOrientation(file);
      const rotation = ORIENTATION_TO_ANGLE[orientation];
      if (rotation) {
        imageDataUrl = await getRotatedImage(imageDataUrl, rotation);
      }
      setImageSrc(imageDataUrl);
    }
  };

  useEffect(() => {
    setInterval(() => {
      var list = document.getElementsByClassName('reactEasyCrop_Image')
      if (list.length > 0) {
        setMaxHeight(list[0].clientHeight);
        setMaxWidth(list[0].clientWidth);
      }
    }, 5000);
  })

  async function changeWidth(vWidth) {
    setWidth(vWidth);
    setCropSize({width: vWidth, height});
  }

  async function changeHeight(vHeight) {
    setHeight(vHeight);
    setCropSize({width, height: vHeight}) 
  }

  return (
    <div>
      {imageSrc ? (
        <React.Fragment>
          <div className={classes.cropContainer}>
            <Cropper
              image={imageSrc}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={1 / 1}
              cropSize={cropSize}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className={classes.controls}>
            <div className={classes.sliderContainer}>
              <Typography
                variant="overline"
                classes={{ root: classes.sliderLabel }}
              >
                Zoom
              </Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.25}
                aria-labelledby="Zoom"
                classes={{ container: classes.slider }}
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </div>
            <div className={classes.sliderContainer}>
              <Typography
                variant="overline"
                classes={{ root: classes.sliderLabel }}
              >
                Rotacionar
              </Typography>
              <Slider
                value={rotation}
                min={0}
                max={360}
                step={0.25}
                aria-labelledby="Rotation"
                classes={{ container: classes.slider }}
                onChange={(e, rotation) => setRotation(rotation)}
              />
            </div>
            
            <div className={classes.sliderContainer}>
              <Typography
                variant="overline"
                classes={{ root: classes.sliderLabel }}
              >
                Largura
              </Typography>
              <Slider
                value={width}
                min={1}
                max={maxWidth}
                step={1}
                aria-labelledby="Largura"
                classes={{ container: classes.slider }}
                onChange={(e, width) => changeWidth(width)}
              />
            </div>

            
            <div className={classes.sliderContainer}>
              <Typography
                variant="overline"
                classes={{ root: classes.sliderLabel }}
              >
                Altura
              </Typography>
              <Slider
                value={height}
                min={1}
                max={maxHeight}
                step={1}
                aria-labelledby="Altura"
                classes={{ container: classes.slider }}
                onChange={(e, height) => changeHeight(height)}
              />
            </div>
            <Button
              onClick={showCroppedImage}
              variant="contained"
              color="primary"
              classes={{ root: classes.cropButton }}
            >
              Selecionar Documento
            </Button>
          </div>
          <div>
          {
            (text !== '') ? 
            (<p>{text}</p>) : 
            (<></>)
          }
          </div>
        </React.Fragment>
      ) : (
        <input type="file" onChange={onFileChange} accept="image/*" />
      )}
    </div>
  );
};

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}

const StyledDemo = withStyles(styles)(Demo);

const rootElement = document.getElementById("root");
ReactDOM.render(<StyledDemo />, rootElement);
