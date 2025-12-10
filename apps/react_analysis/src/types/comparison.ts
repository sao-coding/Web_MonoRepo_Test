interface Info {
  vendor?: string | null
  name: string | null
}

interface BoardDesign {
  Length: number | null
  Width: number | null
  Height: number | null
  Outputs: string | null
  SlotWidth: string | null
  TDP: string | null
  SuggestedPSU: string | null
  PowerConnectors: string | null
  BoardNumber: string | null
}

interface GraphicsCard {
  Processor: string | null
  ReleaseDate: string | null
  Chipset: string | null
  Announced: string | null
  Storage: string | null
  Ethernet: string | null
  Display: string | null
  Audio: string | null
  BIOS: string | null
  FrontIO: string | null
  InternalIO: string | null
  Expansion: string | null
  fTPM: string | null
  PowerInput: string | null
  Dimensions: string | null
  OS: string | null
  Certification: string | null
  Memory: string | null
  Generation?: string | null
  Predecessor?: string | null
  Production?: string | null
  LaunchPrice?: string | null
  BusInterface?: string | null
  Reviews?: string | null
}

interface ClockSpeeds {
  BaseClock: string | null
  BoostClock: string | null
  MemoryClock: string | null
  GameClock?: string | null // GameClock may be present or null
}

interface TDPCompare {
  TDPComparison: string | null
  TDPDefault: string | null
  TDPMax: string | null
  PowerComparison: string | null
  AvgGPUClock: string | null
  MaxMemoryClock: string | null
  Performance: string | null
  PowerLimitDefMax: string | null
  OCPerfMaxPwr: string | null
}

interface GPU {
  GPUMEMCount: number | null
  GPUControllerModel: string | null
  GPUMOSSpec: string | null
}

interface Memory {
  MemoryMEMCount: number | null
  MemoryControllerModel: string | null
  MemoryMOSSpec: string | null
  MemorySize: string | null
  MemoryType: string | null
  MemoryBus: string | null
  Bandwidth: string | null
}

interface PhysicalProperties {
  IdleGPUTemp: string | null
  GamingGPUTemp: string | null
  MemoryTemp: string | null
  Noise: string | null
}

interface GraphicsProcessor {
  GPUName: string | null
  GPUVariant: string | null
  Architecture: string | null
  Foundry: string | null
  ProcessType: string | null
  ProcessSize: string | null
  Transistors: string | null
  Density: string | null
  DieSize: string | null
}

interface RenderConfig {
  ShadingUnits: string | null
  TMUs: string | null
  ROPs: string | null
  SMCount: string | null
  TensorCores: string | null
  RTCores: string | null
  L1Cache: string | null
  L2Cache: string | null
}

interface TheoreticalPerformance {
  PixelRate: string | null
  TextureRate: string | null
  FP16: string | null
  FP32: string | null
  FP64: string | null
}

interface GraphicsFeatures {
  DirectX: string | null
  OpenGL: string | null
  OpenCL: string | null
  Vulkan: string | null
  CUDA: string | null
  ShaderModel: string | null
}

export interface GraphicsCardData {
  Info: Info | null
  BoardDesign?: BoardDesign | null
  GraphicsCard?: GraphicsCard | null
  ClockSpeeds?: ClockSpeeds | null
  TDPCompare?: TDPCompare | null
  GPU?: GPU | null
  Memory?: Memory | null
  PhysicalProperties?: PhysicalProperties | null
  GraphicsProcessor?: GraphicsProcessor | null
  RenderConfig?: RenderConfig | null
  TheoreticalPerformance?: TheoreticalPerformance | null
  GraphicsFeatures?: GraphicsFeatures | null
}

export type GPUComparison = Record<string, GraphicsCardData | null>;
