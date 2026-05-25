import {
  Droplet,
  Lightbulb,
  Paintbrush,
  Sofa,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TipoServico {
  nome: string;
  icone: LucideIcon;
  cor: string;
}

export const TIPOS_SERVICO_MAP: Record<string, TipoServico> = {
  ELETRICO: {
    nome: "Eletrica",
    icone: Zap,
    cor: "#FFD700",
  },
  HIDRAULICO: {
    nome: "Hidraulica",
    icone: Droplet,
    cor: "#1E90FF",
  },
  PINTURA: {
    nome: "Pintura",
    icone: Paintbrush,
    cor: "#FF6347",
  },
  MONTAGEM: {
    nome: "Montagem de moveis",
    icone: Sofa,
    cor: "#8B4513",
  },
  LIMPEZA: {
    nome: "Limpeza",
    icone: Lightbulb,
    cor: "#32CD32",
  },
  MANUTENCAO_GERAL: {
    nome: "Manutencao geral",
    icone: Wrench,
    cor: "#696969",
  },
};

export const TIPOS_SERVICO = Object.keys(TIPOS_SERVICO_MAP);

export function getTipoServico(tipo: string): TipoServico | null {
  return TIPOS_SERVICO_MAP[tipo] || null;
}

export function getIconeServico(tipo: string): LucideIcon | null {
  return TIPOS_SERVICO_MAP[tipo]?.icone || null;
}

export function getCorServico(tipo: string): string {
  return TIPOS_SERVICO_MAP[tipo]?.cor || "#999999";
}
