type PainelSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PainelSectionHeader({
  eyebrow,
  title,
  description,
}: PainelSectionHeaderProps) {
  return (
    <header className="painel-secao-cabecalho">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
