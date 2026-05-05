export interface BoardBackground {
  id: string;
  gradient: string;
  thumbGradient: string;
  label: string;
}

export const defaultBackgrounds: BoardBackground[] = [
  {
    id: "gradient-ocean",
    gradient: "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",
    thumbGradient: "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",
    label: "Ocean",
  },
  {
    id: "gradient-sunset",
    gradient: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
    thumbGradient: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
    label: "Sunset",
  },
  {
    id: "gradient-forest",
    gradient: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    thumbGradient: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    label: "Forest",
  },
  {
    id: "gradient-galaxy",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    thumbGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    label: "Galaxy",
  },
  {
    id: "gradient-midnight",
    gradient: "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d2b55 100%)",
    thumbGradient: "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d2b55 100%)",
    label: "Midnight",
  },
  {
    id: "gradient-peach",
    gradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
    thumbGradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
    label: "Peach",
  },
  {
    id: "gradient-aurora",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    thumbGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    label: "Aurora",
  },
  {
    id: "gradient-lavender",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    thumbGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    label: "Lavender",
  },
  {
    id: "gradient-slate",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    thumbGradient: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    label: "Slate",
  },
];
