package com.servnow.backend.acompanhamento.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrdemServicoSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OrdemServicoSchemaMigration.class);

    private static final String ETAPAS_PERMITIDAS = """
        'AGUARDANDO_CHEGADA',
        'EM_ANDAMENTO',
        'AGUARDANDO_REAGENDAMENTO',
        'VISITA_REAGENDADA',
        'AGUARDANDO_PAGAMENTO',
        'AGUARDANDO_AVALIACAO',
        'CONCLUIDA'
        """;

    private final JdbcTemplate jdbcTemplate;

    public OrdemServicoSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS percentual_concluido integer"
            );
            jdbcTemplate.execute(
                "ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS observacao_reagendamento varchar(300)"
            );
            jdbcTemplate.execute(
                "ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS identidade_verificada_em timestamptz"
            );
            jdbcTemplate.execute(
                "ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS identidade_similaridade double precision"
            );
            normalizarEtapasInvalidas();
            atualizarCheckConstraintEtapa();
        } catch (Exception exception) {
            log.warn("Nao foi possivel aplicar migracao de reagendamento em ordens_servico: {}", exception.getMessage());
        }
    }

    private void normalizarEtapasInvalidas() {
        jdbcTemplate.execute(
            """
            UPDATE ordens_servico
            SET etapa = 'AGUARDANDO_CHEGADA'
            WHERE etapa IS NULL
               OR etapa NOT IN (%s)
            """.formatted(ETAPAS_PERMITIDAS)
        );
    }

    private void atualizarCheckConstraintEtapa() {
        jdbcTemplate.execute("ALTER TABLE ordens_servico DROP CONSTRAINT IF EXISTS ordens_servico_etapa_check");

        List<String> constraints = jdbcTemplate.queryForList(
            """
            SELECT c.conname
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'ordens_servico'
              AND c.contype = 'c'
              AND pg_get_constraintdef(c.oid) ILIKE '%etapa%'
            """,
            String.class
        );

        for (String constraint : constraints) {
            jdbcTemplate.execute("ALTER TABLE ordens_servico DROP CONSTRAINT IF EXISTS \"" + constraint + "\"");
        }

        jdbcTemplate.execute(
            """
            ALTER TABLE ordens_servico
            ADD CONSTRAINT ordens_servico_etapa_check
            CHECK (etapa IN (%s))
            """.formatted(ETAPAS_PERMITIDAS)
        );
    }
}
