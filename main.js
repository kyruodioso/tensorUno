const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');



// se chquea si el navegador puede tener acceso a la camara  
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // Se le da acceso a la camara mediante un click
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
  //Se habilita la camara y se procede a clasificar los objetos
function enableCam(event) {
    // Se continua solo si COCO-SSD termina de cargarse.
    if (!model) {
      return;
    }
    
    // Se remueve el boton tras el click
    event.target.classList.add('removed');  
    
    // mediante getUsermedia se obtiene el video (no el audio)
    const constraints = {
      video: {
        width:{
          ideal:1920
        },
        height:{
          ideal:1080
        }
      },
      audio:false
    };
  
    // se activa el stream de la camara
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }
  
function predictWebcam() {
}

// se guarda el modelo resultante en una variable global
var model = undefined;

//Antes de poder usar la clase COCO-SSD deben cargarse los modelos

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // el modelo empieza a estar en uso.
  demosSection.classList.remove('invisible');
});

var children = [];

function predictWebcam() {
  // En este punto se empieza la clasificacion mediante el stream
  model.detect(video).then(function (predictions) {
    // se van removiendo los cuadros a medida que uno nuevo se genera
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Se recorren las redicciones y se dibujan en la vista si alcanzan nivel alto de confianza;
    for (let n = 0; n < predictions.length; n++) {
      // Si el nivel de confianza sobrepasa el 66% el objeto es detectado y se remarca en el stream mostrando los datos
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
        
      }
    
  
    }
       
    
    window.requestAnimationFrame(predictWebcam);
    
  });

  
}
