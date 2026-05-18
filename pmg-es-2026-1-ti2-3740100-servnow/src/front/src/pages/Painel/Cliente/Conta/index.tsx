import { useEffect, useState } from "react";
import { User } from "lucide-react";

import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeader,
  getAuthSession,
  getValidAuthSession,
  type PerfilResponse,
} from "../../../../services/auth";

export function Conta() {
  const session = getAuthSession();
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  useEffect(() => {
    const validSession = getValidAuthSession();
    if (!validSession?.token) return;
    const token = validSession.token;

    async function carregarPerfil() {
      try {
        const response = await fetch(`${API_URL}/api/perfil/cliente`, {
          headers: authHeader(token),
        });

        if (response.ok) {
          setPerfil((await response.json()) as PerfilResponse);
        }
      } catch {
        setPerfil(null);
      }
    }

    void carregarPerfil();
  }, []);

  const nome = perfil?.nome ?? session?.nome ?? "Cliente Servnow";
  const email = perfil?.email ?? session?.email ?? "cliente@servnow.com";
  const fotoPerfil = perfil?.fotoPerfilBase64 ?? session?.fotoPerfilBase64;
  const fotoPerfilStyle = {
    objectFit: perfil?.fotoPerfilEnquadramento ?? session?.fotoPerfilEnquadramento ?? "cover",
    objectPosition: `${perfil?.fotoPerfilAjusteX ?? session?.fotoPerfilAjusteX ?? 50}% ${perfil?.fotoPerfilAjusteY ?? session?.fotoPerfilAjusteY ?? 50}%`,
  };

  return (
    <>
      <PainelSectionHeader
        eyebrow="Sua conta"
        title="Conta"
        description="Veja seu perfil e acesse as configuracoes de cadastro."
      />

      <section className="painel-conta-grid">
        <div className="painel-conta-card">
          <div className="painel-conta-card-icone">
            <User size={22} />
          </div>
          <h3>Meu perfil</h3>
          <p>Resumo dos seus dados cadastrados na plataforma.</p>

          <div className="painel-conta-perfil-resumo">
            <div className="painel-conta-avatar">
              {fotoPerfil ? (
                <img src={fotoPerfil} alt={`Foto de perfil de ${nome}`} style={fotoPerfilStyle} />
              ) : (
                <User size={26} />
              )}
            </div>
            <div className="painel-conta-info">
              <strong>{nome}</strong>
              <span>{email}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Conta;
