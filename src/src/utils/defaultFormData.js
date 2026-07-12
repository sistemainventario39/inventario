export const defaultFormData = {
  // Datos Generales
  name: "",
  model: "",
  serial: "",
  type: "",
  status: "Bueno",
  description: "",
  acquisitionDate: new Date(),

  // Componentes Internos
  ram: "",
  ramSerial: "",
  ramStatus: "Bueno",
  ramList: [{ capacity: "", status: "Bueno" }],
  storageList: [{ capacity: "", status: "Bueno" }],
  processor: "",
  processorStatus: "Bueno",
  storage: "",
  storageSerial: "",
  storageStatus: "Bueno",

  // Controladores de Periféricos (Checkboxes)
  hasMonitor: false,
  hasKeyboard: false,
  hasMouse: false,
  hasSpeakers: false,

  // Periféricos
  monitorBrand: "",
  monitorSerial: "",
  monitorStatus: "Bueno",
  keyboardBrand: "",
  keyboardSerial: "",
  keyboardStatus: "Bueno",
  mouseBrand: "",
  mouseSerial: "",
  mouseStatus: "Bueno",
  speakersBrand: "",
  speakersSerial: "",
  speakersStatus: "Bueno",

  // Procedencia
  regionP: "",
  estadoP: "",
  cityP: "",
  sedeP: "",
  pisoP: "",
  alaP: "",

  // Ubicación
  region: "",
  estado: "",
  city: "",
  sede: "",
  piso: "",
  ala: "",
};
